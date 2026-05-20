import { IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import smallIcon from "../icons/small_icon.png";
import { useAppSelector } from "../hooks/reduxHooks";
import { AnimatePresence, motion } from "framer-motion";
import { getAuthToken } from "../utils/authToken";
import { useNavigate } from "react-router-dom";
import { requestJson, ApiError } from "../services/apiClient";
import { useSession } from "../context/SessionContext";

export default function Groups() {
  const lightTheme = useAppSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const navigate = useNavigate();
  const { logout } = useSession();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await requestJson("/api/groups", { baseUrl: API_URL, token });
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout("/");
          return;
        }
        setError(err.message || "Failed to fetch groups");
      }
    };

    if (token) {
      fetchGroups();
    }
  }, [API_URL, logout, navigate, token]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ ease: "anticipate", duration: 0.3 }}
        className="user-groups-list-container"
      >
        <div className={`ug-header ${lightTheme ? "" : "dark"}`}>
          <img src={smallIcon} alt="Groups" />
          <p className={`ug-title ${lightTheme ? "" : "dark"}`}>
            Available groups
          </p>
        </div>
        <div className={`sb-search ${lightTheme ? "" : "dark"}`}>
          <IconButton>
            <SearchIcon />
            <input
              placeholder="Search"
              className={`search-box ${lightTheme ? "" : "dark"}`}
            />
          </IconButton>
        </div>
        <div className={`ug-list ${lightTheme ? "" : "dark"}`}>
        {error && <div className="error-message">{error}</div>}
        {users.length === 0 && !error && <p className="empty-state">No groups found.</p>}
        {users.map((group) => (
          <motion.div
            key={group._id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`list-items ${lightTheme ? "" : "dark"}`}
            onClick={() => navigate(`/app/chat/group:${group._id}`, { state: { kind: "group", id: group._id, name: group.name, avatarUrl: group.avatarUrl, status: "Group chat" } })}
          >
            <div className="avatar-wrap">
              {group.avatarUrl
                ? <img className="avatar-image list-avatar" src={group.avatarUrl} alt={group.name || "group"} />
                : <p className="avatar-icon">{group.name?.[0] || "G"}</p>}
              <span className="status-dot online-dot" />
            </div>
            <div className="conversation-text">
              <p className="con-title">{group.name || "Group"}</p>
              <p className="con-last-msg">{group.members?.length || 0} members</p>
            </div>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/app/groups/${group._id}/manage`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </AnimatePresence>
  );
}
