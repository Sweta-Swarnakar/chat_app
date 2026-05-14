import { IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import smallIcon from "../icons/small_icon.png";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { useNavigate } from "react-router-dom";
import { readJsonResponse } from "../utils/api";

export default function Groups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${API_URL}/api/groups`, {
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
          throw new Error("Unable to load groups");
        }

        const data = await readJsonResponse(response);
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to fetch groups");
      }
    };

    if (token) {
      fetchGroups();
    }
  }, [API_URL, token]);

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
            {group.avatarUrl
              ? <img className="avatar-image list-avatar" src={group.avatarUrl} alt={group.name || "group"} />
              : <p className="avatar-icon">{group.name?.[0] || "G"}</p>}
            <p className="con-title">{group.name || "Group"}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </AnimatePresence>
  );
}
