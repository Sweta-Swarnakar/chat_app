import { IconButton, TextField } from '@mui/material'
import React, { useState } from 'react';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import { useNavigate } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from '../utils/authToken';
import { readJsonResponse } from '../utils/api';

export default function CreateGroups() {
  const [groupName, setGroupName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: groupName,
          avatarUrl
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
          navigate("/");
          return;
        }
        const data = await readJsonResponse(response);
        throw new Error(data.message || "Could not create group");
      }

      const group = await readJsonResponse(response);
      navigate(`/app/chat/group:${group._id}`, { state: { kind: "group", id: group._id, name: group.name, avatarUrl: group.avatarUrl, status: "Group chat" } });
    } catch (err) {
      setError(err.message || "Failed to create group");
    }
  };

  return (
    <div className='create-group-container'>
      <TextField
        label='Group name'
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        fullWidth
      />
      <TextField
        label='Group image URL'
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        fullWidth
      />
      {error ? <div className="error-message">{error}</div> : null}
      <IconButton onClick={handleCreate}>
        <DoneOutlineIcon/>
      </IconButton>
    </div>
  )
}
