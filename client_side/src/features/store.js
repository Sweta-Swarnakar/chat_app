import { configureStore } from "@reduxjs/toolkit";
import themeSliceReducer from "./themeSlice";
import conversationSliceReducer from "./conversationSlice";
import userSliceReducer from "./userSlice";

const loadConversationState = () => {
  try {
    const stored = localStorage.getItem("conversationUiState");
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
};

const loadUserState = () => {
  try {
    const stored = localStorage.getItem("userUiState");
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
};

const persistConversationState = (state) => {
  try {
    localStorage.setItem("conversationUiState", JSON.stringify(state));
  } catch {
    // Ignore storage errors so the app keeps working.
  }
};

const persistUserState = (state) => {
  try {
    localStorage.setItem("userUiState", JSON.stringify(state));
  } catch {
    // Ignore storage errors so the app keeps working.
  }
};

export const store = configureStore({
    preloadedState: {
        conversationKey: loadConversationState(),
        userKey: loadUserState()
    },
    reducer: {
        themeKey: themeSliceReducer,
        conversationKey: conversationSliceReducer,
        userKey: userSliceReducer
    }
});

store.subscribe(() => {
  persistConversationState(store.getState().conversationKey);
  persistUserState(store.getState().userKey);
});
