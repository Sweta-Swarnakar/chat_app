import { IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import smallIcon from '../icons/small_icon.png';
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { useNavigate } from "react-router-dom";
import { readJsonResponse } from "../utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
            window.location.href = "/";
            return;
          }
          throw new Error("Unable to load users");
        }

        const data = await readJsonResponse(response);
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to fetch users");
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [API_URL, token]);

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
        {users.map((user) => (
          <div
            key={user._id}
            className="list-items"
            onClick={() => navigate(`/app/chat/${user._id}`, { state: { kind: "user", id: user._id, name: user.name, avatarUrl: user.avatarUrl, status: user.isOnline ? "Online" : "Offline" } })}
          >
            {user.avatarUrl
              ? <img className="avatar-image list-avatar" src={user.avatarUrl} alt={user.name || "user"} />
              : <p className="avatar-icon">{user.name?.[0] || "U"}</p>}
            <p className="con-title">{user.name || "User"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
