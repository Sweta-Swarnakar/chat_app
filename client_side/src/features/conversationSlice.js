import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hiddenConversationIds: [],
  unreadConversationIds: [],
  activityByConversationId: {}
};

const upsertActivity = (state, conversationId, payload) => {
  if (!conversationId) return;

  state.activityByConversationId[conversationId] = {
    ...(state.activityByConversationId[conversationId] || {}),
    ...payload
  };
};

export const conversationSlice = createSlice({
  name: "conversationSlice",
  initialState,
  reducers: {
    resetConversationState: () => ({
      hiddenConversationIds: [],
      unreadConversationIds: [],
      activityByConversationId: {}
    }),
    hideConversation: (state, action) => {
      const conversationId = action.payload;
      if (!conversationId) return;

      state.hiddenConversationIds = Array.from(
        new Set([...state.hiddenConversationIds, conversationId])
      );
      state.unreadConversationIds = state.unreadConversationIds.filter(
        (id) => id !== conversationId
      );
      delete state.activityByConversationId[conversationId];
    },
    showConversation: (state, action) => {
      const conversationId = action.payload;
      if (!conversationId) return;

      state.hiddenConversationIds = state.hiddenConversationIds.filter(
        (id) => id !== conversationId
      );
    },
    markConversationUnread: (state, action) => {
      const { conversationId, lastMessage, timeStamp } = action.payload || {};
      if (!conversationId) return;

      upsertActivity(state, conversationId, { lastMessage, timeStamp });
      if (!state.unreadConversationIds.includes(conversationId)) {
        state.unreadConversationIds.push(conversationId);
      }
    },
    markConversationRead: (state, action) => {
      const conversationId = action.payload;
      if (!conversationId) return;

      state.unreadConversationIds = state.unreadConversationIds.filter(
        (id) => id !== conversationId
      );
    },
    upsertConversationActivity: (state, action) => {
      const { conversationId, lastMessage, timeStamp } = action.payload || {};
      if (!conversationId) return;

      upsertActivity(state, conversationId, { lastMessage, timeStamp });
    }
  }
});

export const {
  resetConversationState,
  hideConversation,
  showConversation,
  markConversationUnread,
  markConversationRead,
  upsertConversationActivity
} = conversationSlice.actions;

export default conversationSlice.reducer;
