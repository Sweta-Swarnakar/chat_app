export const readJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  if (text.trim().startsWith("<")) {
    throw new Error("API returned HTML instead of JSON. Check the backend URL and restart the server.");
  }

  throw new Error(text || response.statusText || "Unexpected response from API");
};
