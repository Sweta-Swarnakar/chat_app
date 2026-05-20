import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/authToken";
import { requestJson, ApiError } from "../services/apiClient";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { setMe } from "../features/userSlice";
import { useSession } from "../context/SessionContext";

const DATA_TTL_MS = 5 * 60 * 1000;

export default function Profile() {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();
  const cachedMe = useAppSelector((state) => state.userKey?.me);
  const cachedMeLoadedAt = useAppSelector((state) => state.userKey?.meLoadedAt);
  const { logout } = useSession();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const now = Date.now();
    const meIsFresh = cachedMe && cachedMeLoadedAt && now - cachedMeLoadedAt < DATA_TTL_MS;

    if (meIsFresh) {
      setName(cachedMe.name || "");
      setAvatarUrl(cachedMe.avatarUrl || "");
      setPreview(cachedMe.avatarUrl || "");
      return;
    }

    const loadProfile = async () => {
      const data = await requestJson("/api/users/me", { baseUrl: API_URL, token });
      setName(data.name || "");
      setAvatarUrl(data.avatarUrl || "");
      setPreview(data.avatarUrl || "");
      dispatch(setMe(data));
    };

    loadProfile().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        logout("/");
        return;
      }
      setError(err.message || "Failed to load profile");
    });
  }, [API_URL, cachedMe, cachedMeLoadedAt, dispatch, logout, navigate, token]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarUrl(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const data = await requestJson("/api/users/me", {
        method: "PUT",
        baseUrl: API_URL,
        token,
        body: { name, avatarUrl }
      });
      setName(data.name || "");
      setAvatarUrl(data.avatarUrl || "");
      setPreview(data.avatarUrl || "");
      dispatch(setMe(data));
      navigate("/app/welcome");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout("/");
        return;
      }
      setError(err.message || "Failed to save profile");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <p className="login-banner">Profile</p>
        {preview ? <img className="profile-avatar" src={preview} alt="profile preview" /> : <div className="profile-avatar placeholder">U</div>}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
        <TextField label="Image URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} fullWidth margin="normal" />
        {error ? <div className="error-message">{error}</div> : null}
        <Button variant="contained" fullWidth onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
