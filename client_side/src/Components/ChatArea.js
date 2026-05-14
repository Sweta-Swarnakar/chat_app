import React, { useEffect, useState } from 'react';
import './styles.css';
import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import MessageSelf from './MessageSelf';
import Messageothers from './MessageOthers';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from "../utils/authToken";
import { readJsonResponse } from "../utils/api";

export default function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId: routeChatId } = useParams();
  const initialChatMeta = location.state || {};
  const [chatMeta, setChatMeta] = useState(initialChatMeta);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const chatId = routeChatId || "general";

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();

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
    setChatMeta(location.state || {});
  }, [location.state, chatId]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchChatMeta = async () => {
      if (chatMeta?.name) {
        return;
      }

      try {
        const isGroupChat = chatId.startsWith("group:");
        const resourceId = isGroupChat ? chatId.replace("group:", "") : chatId;
        const endpoint = isGroupChat ? `/api/groups/${resourceId}` : `/api/users/${resourceId}`;
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          return;
        }

        const data = await readJsonResponse(response);
        setChatMeta({
          kind: isGroupChat ? "group" : "user",
          id: data._id,
          name: data.name,
          avatarUrl: data.avatarUrl || "",
          status: isGroupChat ? "Group chat" : (data.isOnline ? "Online" : "Offline")
        });
      } catch {
        // keep the fallback header
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
            navigate("/");
            return;
          }
          throw new Error("Could not load messages");
        }

        const data = await readJsonResponse(response);
        setMessages(data);
      } catch (err) {
        setError(err.message || "Failed to load messages");
      }
    };

    fetchChatMeta();
    fetchMessages();
  }, [API_URL, chatId, chatMeta?.name, navigate, token]);

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
        if (response.status === 401) {
          clearAuthToken();
          navigate("/");
          return;
        }
        throw new Error("Could not send message");
      }

      const newMessage = await readJsonResponse(response);
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

  const getSenderId = (sender) => {
    if (!sender) return null;
    if (typeof sender === "string") return sender;
    return sender._id || sender.id || null;
  };

  const getSenderName = (sender) => {
    if (!sender) return "User";
    if (typeof sender === "string") return "User";
    return sender.name || "User";
  };

  const isGroupChat = chatId.startsWith("group:");
  const headerName = chatMeta.name || (isGroupChat ? "Group" : "Chat");
  const headerStatus = chatMeta.status || (isGroupChat ? "Group chat" : "Direct chat");
  const headerAvatar = chatMeta.avatarUrl || "";

  return (
    <div className={`chat-area-container ${lightTheme ? "" : "dark"}`}>
      <div className={`chat-area-header ${lightTheme ? "" : "dark"}`}>
        {headerAvatar
          ? <img className="avatar-image header-avatar" src={headerAvatar} alt={headerName} />
          : <p className='avatar-icon'>{headerName[0] || "C"}</p>}
        <div className='header-text'>
          <p className='con-title'>{headerName}</p>
          <p className='con-time-stamp'>{headerStatus}</p>
        </div>
        <IconButton>
          <DeleteOutlineIcon />
        </IconButton>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className='message-container'>
        {messages.length === 0 && <p className="empty-state">No messages yet. Say hi!</p>}
        {messages.map((message) =>
          getSenderId(message.sender) === currentUserId ? (
            <MessageSelf key={message._id || message.createdAt || message.text} message={message.text} />
          ) : (
            <Messageothers key={message._id || message.createdAt || message.text} message={message.text} name={getSenderName(message.sender)} />
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
