import React, { useEffect, useState } from "react";
import "./styles.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import Brightness3Icon from '@mui/icons-material/Brightness3';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ConversationItem from "./ConversationItem";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { themeToggle } from "../features/themeSlice";
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { readJsonResponse } from "../utils/api";

export default function Sidebar() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const [usersResponse, meResponse] = await Promise.all([
          fetch(`${API_URL}/api/users`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        if (!usersResponse.ok) {
          if (usersResponse.status === 401) {
            clearAuthToken();
            navigate("/");
            return;
          }
          throw new Error("Unable to load contacts");
        }

        if (!meResponse.ok) {
          if (meResponse.status === 401) {
            clearAuthToken();
            navigate("/");
            return;
          }
          throw new Error("Unable to load profile");
        }

        const users = await readJsonResponse(usersResponse);
        const meData = await readJsonResponse(meResponse);
        setMe(meData);
        setConversations(users.map((user) => ({
          id: user._id,
          kind: "user",
          name: user.name || "User",
          avatarUrl: user.avatarUrl || "",
          status: user.isOnline ? "Online" : "Offline",
          lastMessage: "Tap to chat",
          timeStamp: new Date(user.createdAt).toLocaleDateString()
        })));
      } catch (err) {
        setError(err.message || "Failed to fetch contacts");
      }
    };

    fetchUsers();
  }, [API_URL, navigate, token]);

  return (
    <div className="sidebar-container">
      <div className={`sb-header ${lightTheme ? "" : "dark"}`}>
        <div>
          <IconButton onClick={() => navigate("/app/profile")}>
            {me?.avatarUrl
              ? <img className="avatar-image header-avatar" src={me.avatarUrl} alt={me?.name || "profile"} />
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
        {conversations.length === 0 && !error ? <p className="empty-state">No conversations yet.</p> : null}
        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} props={conversation} />
        ))}
      </div>
    </div>
  );
}
