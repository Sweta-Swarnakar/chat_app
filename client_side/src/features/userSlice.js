import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  me: null,
  meLoadedAt: null,
  users: [],
  usersLoadedAt: null
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    resetUserState: () => ({
      me: null,
      meLoadedAt: null,
      users: [],
      usersLoadedAt: null
    }),
    setMe: (state, action) => {
      state.me = action.payload || null;
      state.meLoadedAt = Date.now();
    },
    setUsers: (state, action) => {
      state.users = Array.isArray(action.payload) ? action.payload : [];
      state.usersLoadedAt = Date.now();
    },
    setUsersOnlineStatus: (state, action) => {
      const onlineUsers = Array.isArray(action.payload) ? action.payload : [];
      state.users = state.users.map((user) => ({
        ...user,
        isOnline: onlineUsers.includes(user._id)
      }));
      if (state.me) {
        state.me = {
          ...state.me,
          isOnline: onlineUsers.includes(state.me._id)
        };
      }
    },
    clearUserCache: () => ({
      me: null,
      meLoadedAt: null,
      users: [],
      usersLoadedAt: null
    })
  }
});

export const { resetUserState, setMe, setUsers, setUsersOnlineStatus, clearUserCache } = userSlice.actions;
export default userSlice.reducer;
