import React, { useEffect, useState } from 'react';
import './styles.css';
import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import MessageSelf from './MessageSelf';
import Messageothers from './MessageOthers';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const chatHeader = { name: "General", status: "online" };
  const [error, setError] = useState("");
  const chatId = "general";

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("chatAppToken");

  const getUserIdFromToken = (tokenString) => {
    if (!tokenString) return null;
    const payload = tokenString.split('.')[1];
    if (!payload) return null;
    try {
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Could not load messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err.message || "Failed to load messages");
      }
    };

    fetchMessages();
  }, [API_URL, chatId, navigate, token]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, text: inputText })
      });

      if (!response.ok) {
        throw new Error("Could not send message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

  return (
    <div className={`chat-area-container ${lightTheme ? "" : "dark"}`}>
      <div className={`chat-area-header ${lightTheme ? "" : "dark"}`}>
        <p className='avatar-icon'>{chatHeader.name[0]}</p>
        <div className='header-text'>
          <p className='con-title'>{chatHeader.name}</p>
          <p className='con-time-stamp'>{chatHeader.status}</p>
        </div>
        <IconButton>
          <DeleteOutlineIcon />
        </IconButton>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className='message-container'>
        {messages.length === 0 && <p className="empty-state">No messages yet. Say hi!</p>}
        {messages.map((message) =>
          message.sender === currentUserId ? (
            <MessageSelf key={message._id || message.createdAt || Math.random()} message={message.text} />
          ) : (
            <Messageothers key={message._id || message.createdAt || Math.random()} message={message.text} name={message.sender || "User"} />
          )
        )}
      </div>

      <div className='input-text-area'>
        <input
          placeholder="Type a message"
          className="search-box"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <IconButton onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}
