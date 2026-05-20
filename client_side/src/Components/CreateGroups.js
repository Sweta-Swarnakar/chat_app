import React, { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthToken, getUserIdFromToken } from "../utils/authToken";
import { requestJson, ApiError } from "../services/apiClient";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { setUsers } from "../features/userSlice";
import { useSession } from "../context/SessionContext";

const DATA_TTL_MS = 5 * 60 * 1000;
const EMPTY_USERS = [];

export default function CreateGroups() {
  const [groupName, setGroupName] = useState("");
  const [preview, setPreview] = useState("");
  const [avatarData, setAvatarData] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const currentUserId = getUserIdFromToken(token);
  const dispatch = useAppDispatch();
  const cachedUsers = useAppSelector((state) => state.userKey?.users) ?? EMPTY_USERS;
  const cachedUsersLoadedAt = useAppSelector((state) => state.userKey?.usersLoadedAt);
  const { logout } = useSession();
  const isEditMode = !!groupId;

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      const now = Date.now();
      const usersAreFresh = cachedUsers.length > 0 && cachedUsersLoadedAt && now - cachedUsersLoadedAt < DATA_TTL_MS;

      if (usersAreFresh && !isEditMode) {
        setMembers(cachedUsers.filter((user) => user._id !== currentUserId));
        setLoading(false);
        return;
      }

      try {
        const [usersData, groupData] = await Promise.all([
          requestJson("/api/users", { baseUrl: API_URL, token }),
          isEditMode ? requestJson(`/api/groups/${groupId}`, { baseUrl: API_URL, token }) : Promise.resolve(null)
        ]);
        const usersList = Array.isArray(usersData) ? usersData : usersData.data || [];
        setMembers(usersList.filter((user) => user._id !== currentUserId));
        dispatch(setUsers(usersList));

        if (groupData) {
          setGroupName(groupData.name || "");
          setPreview(groupData.avatarUrl || "");
          setAvatarData(groupData.avatarUrl || "");
          setSelectedMemberIds(
            (groupData.members || [])
              .map((member) => member._id || member.id)
              .filter((memberId) => memberId && memberId !== currentUserId)
          );
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout("/");
          return;
        }
        setError(err.message || "Failed to load group form");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_URL, cachedUsers, cachedUsersLoadedAt, currentUserId, dispatch, groupId, isEditMode, logout, navigate, token]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarData(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleMember = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const group = await requestJson(
        isEditMode ? `/api/groups/${groupId}` : "/api/groups",
        {
          method: isEditMode ? "PUT" : "POST",
          baseUrl: API_URL,
          token,
          body: {
            name: groupName,
            avatarUrl: avatarData,
            memberIds: selectedMemberIds
          }
        }
      );
      navigate(`/app/chat/group:${group._id}`, {
        state: {
          kind: "group",
          id: group._id,
          name: group.name,
          avatarUrl: group.avatarUrl || "",
          status: "Group chat"
        }
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout("/");
        return;
      }
      setError(err.message || "Failed to save group");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="create-group-container">Loading...</div>;
  }

  return (
    <div className="create-group-container">
      <p className="login-banner">{isEditMode ? "Edit Group" : "Create Group"}</p>
      <div className="group-preview-row">
        {preview ? (
          <img className="profile-avatar" src={preview} alt="group preview" />
        ) : (
          <div className="profile-avatar placeholder">G</div>
        )}
        <Button variant="outlined" component="label">
          Upload image
          <input hidden type="file" accept="image/*" onChange={handleFileChange} />
        </Button>
      </div>

      <TextField
        label="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        fullWidth
      />

      <div className="member-picker">
        <p className="member-picker-title">Add people</p>
        <div className="member-list">
          {members.length === 0 ? (
            <p className="empty-state">No users available.</p>
          ) : (
            members.map((member) => (
              <FormControlLabel
                key={member._id}
                control={
                  <Checkbox
                    checked={selectedMemberIds.includes(member._id)}
                    onChange={() => toggleMember(member._id)}
                  />
                }
                label={member.name || "User"}
              />
            ))
          )}
        </div>
      </div>

      {error ? <div className="error-message">{error}</div> : null}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={saving}
        startIcon={<DoneOutlineIcon />}
      >
        {saving ? "Saving..." : isEditMode ? "Update Group" : "Create Group"}
      </Button>
    </div>
  );
}
