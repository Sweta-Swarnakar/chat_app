import React, { useEffect, useState } from 'react';
import './styles.css';
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageSelf from './MessageSelf';
import Messageothers from './MessageOthers';
import { useAppDispatch } from '../hooks/reduxHooks';
import { useLocation, useParams } from 'react-router-dom';
import { getAuthToken } from "../utils/authToken";
import { requestJson, ApiError } from "../services/apiClient";
import { markConversationRead, upsertConversationActivity } from "../features/conversationSlice";
import { useSession } from '../context/SessionContext';
import { useAppSelector } from '../hooks/reduxHooks';

export default function ChatArea() {
  const lightTheme = useAppSelector((state) => state.themeKey);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { chatId: routeChatId } = useParams();
  const initialChatMeta = location.state || {};
  const [chatMeta, setChatMeta] = useState(initialChatMeta);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const chatId = routeChatId || "general";
  const { socket, userId, logout, isAuthenticated } = useSession();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = getAuthToken();

  const currentUserId = userId;
  const isGroupChat = chatId.startsWith("group:");
  const directPartnerId = isGroupChat ? null : chatId;
  const conversationId = isGroupChat
    ? chatId
    : currentUserId && directPartnerId
      ? `direct:${[currentUserId, directPartnerId].sort().join("_")}`
      : chatId;

  useEffect(() => {
    setChatMeta(location.state || {});
  }, [location.state, chatId]);

  useEffect(() => {
    if (!token || !currentUserId || !isAuthenticated) {
      logout("/");
      return;
    }

    const fetchChatMeta = async () => {
      if (chatMeta?.name) {
        return;
      }

      try {
        const resourceId = isGroupChat ? chatId.replace("group:", "") : directPartnerId;
        const endpoint = isGroupChat ? `/api/groups/${resourceId}` : `/api/users/${resourceId}`;
        const data = await requestJson(endpoint, { baseUrl: API_URL, token });
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
        const data = await requestJson(`/api/chat/${conversationId}`, { baseUrl: API_URL, token });
        setMessages(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout("/");
          return;
        }
        setError(err.message || "Failed to load messages");
      }
    };

    fetchChatMeta();
    fetchMessages();
    dispatch(markConversationRead(conversationId));
  }, [API_URL, chatId, chatMeta?.name, conversationId, currentUserId, directPartnerId, dispatch, isAuthenticated, isGroupChat, logout, token]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      const newMessage = await requestJson("/api/chat/message", {
        method: "POST",
        baseUrl: API_URL,
        token,
        body: { chatId: conversationId, text: inputText }
      });
      setMessages((prev) => [...prev, newMessage]);
      dispatch(upsertConversationActivity({
        conversationId,
        lastMessage: newMessage.text,
        timeStamp: newMessage.createdAt ? new Date(newMessage.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      }));
      dispatch(markConversationRead(conversationId));
      if (!isGroupChat) {
        socket?.emit("send_message", {
          receiverId: directPartnerId,
          chatId: conversationId,
          senderId: currentUserId,
          text: newMessage.text,
          message: newMessage
        });
      }
      setInputText("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout("/");
        return;
      }
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

  const headerName = chatMeta.name || (isGroupChat ? "Group" : "Chat");
  const headerStatus = chatMeta.status || (isGroupChat ? "Group chat" : "Direct chat");
  const headerAvatar = chatMeta.avatarUrl || "";

  return (
    <div className={`chat-area-container ${lightTheme ? "" : "dark"}`}>
      <div className={`chat-area-header ${lightTheme ? "" : "dark"}`}>
        {headerAvatar
          ? <img className="avatar-image chat-avatar" src={headerAvatar} alt={headerName} />
          : <p className='avatar-icon'>{headerName[0] || "C"}</p>}
        <div className='header-text'>
          <p className='con-title'>{headerName}</p>
          <p className='con-time-stamp'>{headerStatus}</p>
        </div>
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
