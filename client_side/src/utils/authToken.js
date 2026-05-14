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
