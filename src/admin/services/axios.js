import httpClient, {
  normalizeUrl,
  isAuthEndpoint,
  parseRefreshResponse,
  executeSilentRefresh,
  forceRefreshAccessToken,
} from "../../services/api/httpClient.js";
import { tokenService, isTokenExpired } from "../../services/auth/tokenService.js";

export const axiosInstance = httpClient;
export { normalizeUrl, parseRefreshResponse, executeSilentRefresh, forceRefreshAccessToken };
export const isAuthPath = isAuthEndpoint;

export async function ensureAccessToken() {
  const token = tokenService.getAccessToken();
  if (token && !isTokenExpired(token)) return token;
  return forceRefreshAccessToken();
}

export default httpClient;
