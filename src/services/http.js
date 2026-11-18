import httpClient, { getBaseUrl, unwrapList, unwrapItem } from "./api/httpClient.js";

export const API_BASE = getBaseUrl();

export function isApiEnabled() {
  return API_BASE.length > 0;
}

export const apiGet = (path, opts) => httpClient.get(path, opts).then((r) => r.data);
export const apiPost = (path, body, opts) => httpClient.post(path, body, opts).then((r) => r.data);
export const apiPut = (path, body, opts) => httpClient.put(path, body, opts).then((r) => r.data);
export const apiPatch = (path, body, opts) => httpClient.patch(path, body, opts).then((r) => r.data);
export const apiDelete = (path, opts) => httpClient.delete(path, opts).then((r) => r.data);

export { unwrapList, unwrapItem };
export default httpClient;
