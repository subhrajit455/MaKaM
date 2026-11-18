import httpClient, {
  api,
  getBaseUrl,
  isAuthEndpoint,
  executeSilentRefresh,
  forceRefreshAccessToken,
  normalizeUrl,
  parseRefreshResponse,
} from "../../services/api/httpClient.js";

export {
  api,
  getBaseUrl,
  isAuthEndpoint,
  executeSilentRefresh,
  forceRefreshAccessToken,
  normalizeUrl,
  parseRefreshResponse,
};

export default httpClient;
