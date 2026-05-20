export const buildDirectConversationId = (userA, userB) => {
  if (!userA || !userB) return null;
  return `direct:${[userA, userB].sort().join("_")}`;
};

export const getConversationKeyFromPath = (pathname, currentUserId) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "app" || segments[1] !== "chat") {
    return null;
  }

  const rawChatId = segments[2];
  if (!rawChatId) return null;

  if (rawChatId.startsWith("group:")) {
    return rawChatId;
  }

  return buildDirectConversationId(currentUserId, rawChatId);
};
