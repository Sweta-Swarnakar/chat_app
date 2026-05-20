export const getAuthToken = () => {
  const token = localStorage.getItem("chatAppToken");

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

export const clearAuthToken = () => {
  localStorage.removeItem("chatAppToken");
};

export const getUserIdFromToken = (token) => {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(normalized));
    return decoded.id || null;
  } catch {
    return null;
  }
};

export const isValidAuthToken = (token) => {
  const userId = getUserIdFromToken(token);
  if (!userId) return false;

  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(normalized));

    if (!decoded.exp) return true;

    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
