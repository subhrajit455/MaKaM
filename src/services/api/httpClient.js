import axios from "axios";
import { tokenService, getStoredAuthToken, isTokenExpired } from "../auth/tokenService.js";
import { getApiBaseUrl } from "../../configs/api.js";

// Global default headers
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

export const getBaseUrl = () => {
  const metaEnv = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
  const useProxy = String(metaEnv.VITE_USE_DEV_API_PROXY || "").toLowerCase() === "true";
  if (useProxy) return "";
  return getApiBaseUrl();
};

export const normalizeUrl = (baseURL = "", url = "") => {
  if (/\/api\/v1\/?$/.test(String(baseURL)) && String(url).startsWith("/api/v1/")) {
    return String(url).replace(/^\/api\/v1/, "");
  }
  return url;
};

export const isAuthEndpoint = (url = "") =>
  /\/auth\/(login|send-otp|verify-otp|refresh-token|logout)(?:$|\/)|\/login\/(request-otp|verify-otp)(?:$|\/)|\/otp\/(send-otp|verify-otp)(?:$|\/)/.test(
    String(url)
  );

export const parseRefreshResponse = (response) => {
  const body = response?.data ?? {};
  const data = body?.data ?? body;
  const token = data?.accessToken ?? data?.token ?? body?.accessToken ?? body?.token;
  const refreshToken = data?.refreshToken ?? body?.refreshToken ?? null;
  if (!token || typeof token !== "string") {
    throw new Error("Refresh endpoint did not return an access token.");
  }
  return { token, refreshToken, user: data?.user ?? body?.user ?? null };
};

let activeSilentRefreshPromise = null;

/**
 * Single, deduplicated silent token refresh handler with cookie & fallback header support.
 */
export async function executeSilentRefresh() {
  const storedRefreshToken = tokenService.getRefreshToken();
  if (!storedRefreshToken && !tokenService.hasSession()) {
    throw new Error("No active session or refresh token available.");
  }

  if (activeSilentRefreshPromise) {
    return activeSilentRefreshPromise;
  }

  tokenService.setIsRefreshing(true);

  activeSilentRefreshPromise = (async () => {
    try {
      const metaEnv = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
      const useProxy = String(metaEnv.VITE_USE_DEV_API_PROXY || "").toLowerCase() === "true";
      const apiRoot = useProxy ? "" : getApiBaseUrl();
      const refreshPath = metaEnv.VITE_AUTH_REFRESH_ENDPOINT || "/api/v1/auth/refresh-token";
      const fullURL = `${apiRoot}${refreshPath}`;

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      if (metaEnv.VITE_SEND_REFRESH_HEADER === "true" && storedRefreshToken) {
        headers["x-refresh-token"] = storedRefreshToken;
      }

      const payload = storedRefreshToken ? { refreshToken: storedRefreshToken } : {};

      const response = await axios.post(fullURL, payload, {
        withCredentials: true,
        headers,
        timeout: 15000,
      });

      const { token, refreshToken: newRt, user } = parseRefreshResponse(response);
      tokenService.setAccessToken(token);
      if (newRt) {
        tokenService.setRefreshToken(newRt);
      }
      if (user) {
        tokenService.setUserProfile(user);
      }
      return { token, refreshToken: newRt, user };
    } finally {
      tokenService.setIsRefreshing(false);
      activeSilentRefreshPromise = null;
    }
  })();

  return activeSilentRefreshPromise;
}

const isAuthRejection = (error) => [400, 401, 403].includes(error?.response?.status);

export async function forceRefreshAccessToken() {
  try {
    const result = await executeSilentRefresh();
    tokenService.drainQueueSuccess(result.token);
    return result.token;
  } catch (error) {
    tokenService.drainQueueFailure(error);
    if (isAuthRejection(error)) {
      tokenService.clearAll();
    }
    throw error;
  }
}

export const httpClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 65000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Outbound Request Interceptor
httpClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers.Accept = config.headers.Accept || "application/json";
  config.withCredentials = true;

  // In dev proxy mode, ensure absolute URLs pointing to localhost/proxies strip host
  const metaEnv = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
  const useProxy = String(metaEnv.VITE_USE_DEV_API_PROXY || "").toLowerCase() === "true";
  if ((useProxy || !config.baseURL) && typeof config.url === "string") {
    config.url = config.url.replace(/^https?:\/\/[^/]+(?::\d+)?(?=\/api\/|\/webhook\/|\/health)/i, "");
  }

  // Idempotency safety: preserve idempotencyKey in request body if header is passed
  const idempotencyHeader = config.headers["Idempotency-Key"] || config.headers["idempotency-key"];
  if (idempotencyHeader && config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
    if (!config.data.idempotencyKey) {
      config.data.idempotencyKey = idempotencyHeader;
    }
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
  }

  if (!isAuthEndpoint(config.url)) {
    let token = getStoredAuthToken() || tokenService.getAccessToken() || tokenService.getRawStoredToken();
    if (token && typeof isTokenExpired === "function" && isTokenExpired(token)) {
      token = null;
    }

    const existingAuth =
      typeof config.headers.get === "function"
        ? config.headers.get("Authorization")
        : config.headers.Authorization || config.headers.authorization;

    if (existingAuth && typeof existingAuth === "string" && existingAuth.startsWith("Bearer ")) {
      const headerToken = existingAuth.slice(7).trim();
      if (headerToken && typeof isTokenExpired === "function" && isTokenExpired(headerToken)) {
        if (typeof config.headers.delete === "function") {
          config.headers.delete("Authorization");
          config.headers.delete("authorization");
        } else {
          delete config.headers.Authorization;
          delete config.headers.authorization;
        }
      }
    }

    if (token) {
      const currentAuth =
        typeof config.headers.get === "function"
          ? config.headers.get("Authorization")
          : config.headers.Authorization || config.headers.authorization;

      if (!currentAuth) {
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else if (config.headers.authorization && !config.headers.Authorization) {
        config.headers.Authorization = config.headers.authorization;
        delete config.headers.authorization;
      }
    }
  }

  return config;
});

// Inbound Response Interceptor
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (status !== 401 || !original) {
      return Promise.reject(error);
    }

    if (original._skipAuthRefresh || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    if (!tokenService.getRefreshToken() && !tokenService.hasSession()) {
      return Promise.reject(error);
    }

    if (original._retry) {
      if (!original._skipSessionClear) {
        tokenService.clearAll();
      }
      return Promise.reject(error);
    }

    original._retry = true;

    if (tokenService.isRefreshing()) {
      return new Promise((resolve, reject) => {
        tokenService.enqueueRequest(
          (newToken) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            if (original.params?.token) original.params.token = newToken;
            resolve(httpClient(original));
          },
          (rejectErr) => reject(rejectErr)
        );
      });
    }

    tokenService.setIsRefreshing(true);

    let newToken;
    try {
      const refreshResult = await executeSilentRefresh();
      newToken = refreshResult.token;
      tokenService.drainQueueSuccess(newToken);
    } catch (refreshError) {
      tokenService.drainQueueFailure(refreshError);
      const isAuthFail = [400, 401, 403].includes(refreshError?.response?.status);
      if (isAuthFail && !original._skipSessionClear) {
        tokenService.clearAll();
      }
      return Promise.reject(refreshError);
    } finally {
      tokenService.setIsRefreshing(false);
    }

    original.headers = original.headers || {};
    original.headers.Authorization = `Bearer ${newToken}`;
    if (original.params?.token) original.params.token = newToken;
    return httpClient(original);
  }
);

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      const nestedNamed = ["packages", "bookings", "items", "results", "rows", "records", "data"];
      for (const key of nestedNamed) {
        if (Array.isArray(payload.data[key])) return payload.data[key];
      }
      const nestedArray = Object.values(payload.data).find((v) => Array.isArray(v));
      if (nestedArray) return nestedArray;
    }
    const named = ["data", "items", "results", "rows", "records", "packages", "bookings"];
    for (const key of named) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    const firstArray = Object.values(payload).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
  }
  return [];
}

export function unwrapItem(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === "object") return payload.data;
  }
  return payload;
}

export const api = httpClient;
export default httpClient;
