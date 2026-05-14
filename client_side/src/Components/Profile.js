import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { readJsonResponse } from "../utils/api";

export default function Profile() {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
          navigate("/");
          return;
        }
        throw new Error("Could not load profile");
      }

      const data = await readJsonResponse(response);
      setName(data.name || "");
      setAvatarUrl(data.avatarUrl || "");
      setPreview(data.avatarUrl || "");
    };

    loadProfile().catch((err) => setError(err.message || "Failed to load profile"));
  }, [API_URL, navigate, token]);

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
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatarUrl })
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
          navigate("/");
          return;
        }
        const data = await readJsonResponse(response);
        throw new Error(data.message || "Could not save profile");
      }

      const data = await readJsonResponse(response);
      setName(data.name || "");
      setAvatarUrl(data.avatarUrl || "");
      setPreview(data.avatarUrl || "");
      navigate("/app/welcome");
    } catch (err) {
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
