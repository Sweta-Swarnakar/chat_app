import { getAuthToken } from "../utils/authToken";
import { readJsonResponse } from "../utils/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const getApiBaseUrl = () => process.env.REACT_APP_API_URL || "http://localhost:5000";

export const requestJson = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    token = getAuthToken(),
    baseUrl = getApiBaseUrl()
  } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await readJsonResponse(response).catch(async () => {
    const fallback = await response.text().catch(() => "");
    return fallback;
  });

  if (!response.ok) {
    const message = typeof payload === "string"
      ? payload
      : payload?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status, payload);
  }

  return payload;
};
