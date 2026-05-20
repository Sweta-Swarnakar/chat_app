import { IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import smallIcon from '../icons/small_icon.png';
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/authToken";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { setUsers } from "../features/userSlice";
import { requestJson, ApiError } from "../services/apiClient";
import { useSession } from "../context/SessionContext";
import { buildDirectConversationId } from "../utils/conversation";

const DATA_TTL_MS = 5 * 60 * 1000;
const EMPTY_USERS = [];

export default function Users() {
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cachedUsers = useAppSelector((state) => state.userKey?.users) ?? EMPTY_USERS;
  const cachedUsersLoadedAt = useAppSelector((state) => state.userKey?.usersLoadedAt);
  const conversationUi = useAppSelector((state) => state.conversationKey);
  const { logout, userId } = useSession();
  const [users, setUsersLocal] = useState(cachedUsers);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const now = Date.now();
    const usersAreFresh = cachedUsers.length > 0 && cachedUsersLoadedAt && now - cachedUsersLoadedAt < DATA_TTL_MS;

    if (usersAreFresh) {
      setUsersLocal(cachedUsers);
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await requestJson("/api/users", { baseUrl: API_URL, token });
        const list = Array.isArray(data) ? data : data.data || [];
        setUsersLocal(list);
        dispatch(setUsers(list));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout("/");
          return;
        }
        setError(err.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, [API_URL, cachedUsers, cachedUsersLoadedAt, dispatch, logout, navigate, token]);

  return (
    <div className="user-groups-list-container">
      <div className="ug-header">
        <img src={smallIcon} alt="Online users" />
        <p className="ug-title">Online users</p>
      </div>
      <div className="sb-search">
        <IconButton>
          <SearchIcon />
          <input placeholder="Search" className="search-box" />
        </IconButton>
      </div>
      <div className="ug-list">
        {error && <div className="error-message">{error}</div>}
        {users.length === 0 && !error && <p className="empty-state">No users found.</p>}
        {users.map((user) => {
          const conversationId = userId ? buildDirectConversationId(userId, user._id) : null;
          const isUnread = conversationId ? conversationUi?.unreadConversationIds?.includes(conversationId) : false;

          return (
            <div
              key={user._id}
              className={`list-items ${isUnread ? "unread" : ""}`}
              onClick={() => navigate(`/app/chat/${user._id}`, { state: { kind: "user", id: user._id, name: user.name, avatarUrl: user.avatarUrl, status: user.isOnline ? "Online" : "Offline" } })}
            >
              <div className="avatar-wrap">
                {user.avatarUrl
                  ? <img className="avatar-image list-avatar" src={user.avatarUrl} alt={user.name || "user"} />
                  : <p className="avatar-icon">{user.name?.[0] || "U"}</p>}
                <span className={`status-dot ${user.isOnline ? "online-dot" : "offline-dot"}`} />
              </div>
              <div className="conversation-text">
                <p className={`con-title ${isUnread ? "unread-title" : ""}`}>{user.name || "User"}</p>
                <p className="con-last-msg">{isUnread ? "New message" : "Tap to chat"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
