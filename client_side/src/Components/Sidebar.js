import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import Brightness3Icon from '@mui/icons-material/Brightness3';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ConversationItem from "./ConversationItem";
import { useLocation, useNavigate } from "react-router-dom";
import { themeToggle } from "../features/themeSlice";
import { getAuthToken, getUserIdFromToken } from "../utils/authToken";
import { hideConversation } from "../features/conversationSlice";
import { setMe, setUsers } from "../features/userSlice";
import { getConversationKeyFromPath, buildDirectConversationId } from "../utils/conversation";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { requestJson, ApiError } from "../services/apiClient";
import { useSession } from "../context/SessionContext";

const DATA_TTL_MS = 5 * 60 * 1000;
const EMPTY_CONVERSATION_UI = {
  hiddenConversationIds: [],
  unreadConversationIds: [],
  activityByConversationId: {}
};
const EMPTY_USERS = [];

export default function Sidebar() {
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const lightTheme = useAppSelector((state) => state.themeKey);
  const conversationUi = useAppSelector((state) => state.conversationKey) ?? EMPTY_CONVERSATION_UI;
  const cachedMe = useAppSelector((state) => state.userKey?.me);
  const cachedMeLoadedAt = useAppSelector((state) => state.userKey?.meLoadedAt);
  const cachedUsers = useAppSelector((state) => state.userKey?.users) ?? EMPTY_USERS;
  const cachedUsersLoadedAt = useAppSelector((state) => state.userKey?.usersLoadedAt);
  const navigate = useNavigate();
  const location = useLocation();
  const { onlineUsers, logout } = useSession();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const userId = getUserIdFromToken(token);
  const activeConversationId = useMemo(
    () => getConversationKeyFromPath(location.pathname, userId),
    [location.pathname, userId]
  );

  useEffect(() => {
    if (!token || !userId) {
      logout("/");
      return;
    }

    const now = Date.now();
    const usersAreFresh = cachedUsers.length > 0 && cachedUsersLoadedAt && now - cachedUsersLoadedAt < DATA_TTL_MS;
    const meIsFresh = cachedMe && cachedMeLoadedAt && now - cachedMeLoadedAt < DATA_TTL_MS;

    if (usersAreFresh && meIsFresh) {
      return;
    }

    const fetchUsers = async () => {
      try {
        const [usersData, meData] = await Promise.all([
          requestJson("/api/users", { baseUrl: API_URL, token }),
          requestJson("/api/users/me", { baseUrl: API_URL, token })
        ]);
        const users = Array.isArray(usersData) ? usersData : usersData.data || [];
        dispatch(setMe(meData));
        dispatch(setUsers(users));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout("/");
          return;
        }
        setError(err.message || "Failed to fetch contacts");
      }
    };

    fetchUsers();
  }, [API_URL, cachedMe, cachedMeLoadedAt, cachedUsers, cachedUsersLoadedAt, dispatch, logout, token, userId]);

  const visibleConversations = useMemo(() => cachedUsers
    .map((user) => ({
      chatId: buildDirectConversationId(userId, user._id),
      routeId: user._id,
      id: user._id,
      kind: "user",
      name: user.name || "User",
      avatarUrl: user.avatarUrl || "",
      status: onlineUsers.includes(user._id) ? "Online" : "Offline",
      lastMessage: "Tap to chat",
      timeStamp: new Date(user.createdAt).toLocaleDateString()
    }))
    .filter((conversation) => !conversationUi.hiddenConversationIds.includes(conversation.chatId))
    .map((conversation) => {
      const activity = conversationUi.activityByConversationId[conversation.chatId];
      return {
        ...conversation,
        lastMessage: activity?.lastMessage || conversation.lastMessage,
        timeStamp: activity?.timeStamp || conversation.timeStamp,
        isUnread: conversationUi.unreadConversationIds.includes(conversation.chatId)
      };
    }), [cachedUsers, conversationUi.activityByConversationId, conversationUi.hiddenConversationIds, conversationUi.unreadConversationIds, onlineUsers, userId]);

  const handleDeleteConversation = (conversation) => {
    dispatch(hideConversation(conversation.chatId));
    if (activeConversationId === conversation.chatId) {
      navigate("/app/welcome", { replace: true });
    }
  };

  return (
    <div className="sidebar-container">
      <div className={`sb-header ${lightTheme ? "" : "dark"}`}>
        <div>
          <IconButton onClick={() => navigate("/app/profile")}>
            {cachedMe?.avatarUrl
              ? <img className="avatar-image header-avatar" src={cachedMe.avatarUrl} alt={cachedMe?.name || "profile"} />
              : <AccountCircleIcon className={`icon ${lightTheme ? "" : "dark"}`} />}
          </IconButton>
        </div>
        <div>
          <IconButton onClick={() => navigate("/app/users")}>
            <PersonAddAltIcon className={`icon ${lightTheme ? "" : "dark"}`} />
          </IconButton>
          <IconButton onClick={() => navigate("/app/groups")}>
            <GroupAddIcon className={`icon ${lightTheme ? "" : "dark"}`} />
          </IconButton>
          <IconButton onClick={() => navigate("/app/create-groups")}>
            <span className={`icon ${lightTheme ? "" : "dark"}`}>+</span>
          </IconButton>
          <IconButton onClick={() => dispatch(themeToggle())}>
            {lightTheme ? <Brightness3Icon className={`icon ${lightTheme ? "" : "dark"}`} /> : <Brightness7Icon className={`icon ${lightTheme ? "" : "dark"}`} />}
          </IconButton>
        </div>
      </div>
      <div className={`sb-search ${lightTheme ? "" : "dark"}`}>
        <IconButton>
          <SearchIcon className={`icon ${lightTheme ? "" : "dark"}`} />
        </IconButton>
        <input placeholder="Search" className={`search-box ${lightTheme ? "" : "dark"}`} />
      </div>
      <div className={`sb-convo ${lightTheme ? "" : "dark"}`}>
        {error ? <div className="error-message">{error}</div> : null}
        {visibleConversations.length === 0 && !error ? <p className="empty-state">No conversations yet.</p> : null}
        {visibleConversations.map((conversation) => (
          <ConversationItem
            key={conversation.chatId}
            props={conversation}
            onDelete={handleDeleteConversation}
          />
        ))}
      </div>
    </div>
  );
}
