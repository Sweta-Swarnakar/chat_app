import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageSelf from './MessageSelf';
import Messageothers from './MessageOthers';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useLocation, useParams } from 'react-router-dom';
import { getAuthToken } from "../utils/authToken";
import { requestJson, ApiError } from "../services/apiClient";
import { markConversationRead, upsertConversationActivity } from "../features/conversationSlice";
import { useSession } from '../context/SessionContext';

export default function ChatArea() {
  const lightTheme = useAppSelector((state) => state.themeKey);
  const cachedMe = useAppSelector((state) => state.userKey?.me);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { chatId: routeChatId } = useParams();
  const initialChatMeta = location.state || {};
  const routeChatMeta = location.state || {};
  const [chatMeta, setChatMeta] = useState(initialChatMeta);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const messageContainerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const chatId = routeChatId || "general";
  const { socket, emitSocketEvent, userId, logout, isAuthenticated } = useSession();

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
      if (routeChatMeta?.name) {
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
  }, [API_URL, chatId, conversationId, currentUserId, directPartnerId, dispatch, isAuthenticated, isGroupChat, logout, routeChatMeta?.name, token]);

  useEffect(() => {
    setMessages([]);
    setError("");
    stickToBottomRef.current = true;
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleIncomingMessage = (incomingMessage) => {
      const message = incomingMessage?.message || incomingMessage;
      if (!message || message.chatId !== conversationId) return;

      setMessages((prev) => {
        if (message._id && prev.some((existing) => existing._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      dispatch(upsertConversationActivity({
        conversationId,
        lastMessage: message.text,
        timeStamp: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      }));
      dispatch(markConversationRead(conversationId));
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [conversationId, dispatch, socket]);

  useEffect(() => {
    if (!messageContainerRef.current) return;

    const container = messageContainerRef.current;
    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    if (messages.length === 0) {
      requestAnimationFrame(scrollToBottom);
      return;
    }

    if (stickToBottomRef.current) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [conversationId, messages]);

  const handleMessageScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 96;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _optimisticId: tempId,
      chatId: conversationId,
      sender: currentUserId,
      text: inputText.trim(),
      createdAt: new Date().toISOString()
    };
    const pendingText = inputText.trim();
    setMessages((prev) => [...prev, optimisticMessage]);
    dispatch(upsertConversationActivity({
      conversationId,
      lastMessage: pendingText,
      timeStamp: new Date().toLocaleDateString()
    }));
    dispatch(markConversationRead(conversationId));
    setInputText("");

    try {
      const newMessage = await requestJson("/api/chat/message", {
        method: "POST",
        baseUrl: API_URL,
        token,
        body: { chatId: conversationId, text: pendingText }
      });
      setMessages((prev) => prev.map((message) => (
        message._optimisticId === tempId ? newMessage : message
      )));
      dispatch(upsertConversationActivity({
        conversationId,
        lastMessage: newMessage.text,
        timeStamp: newMessage.createdAt ? new Date(newMessage.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      }));
      dispatch(markConversationRead(conversationId));
      if (!isGroupChat) {
        emitSocketEvent("send_message", {
          receiverId: directPartnerId,
          chatId: conversationId,
          senderId: currentUserId,
          text: newMessage.text,
          message: newMessage
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message._optimisticId !== tempId));
      if (err instanceof ApiError && err.status === 401) {
        logout("/");
        return;
      }
      setInputText(pendingText);
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

  const getSenderAvatar = (sender) => {
    if (!sender || typeof sender === "string") return "";
    return sender.avatarUrl || "";
  };

  const selfName = cachedMe?.name || "Me";
  const selfAvatarUrl = cachedMe?.avatarUrl || "";

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

      <div className='message-container' ref={messageContainerRef} onScroll={handleMessageScroll}>
        {messages.length === 0 && <p className="empty-state">No messages yet. Say hi!</p>}
        {messages.map((message) =>
          getSenderId(message.sender) === currentUserId ? (
            <MessageSelf
              key={message._id || message.createdAt || message.text}
              message={message.text}
              time={message.createdAt}
              name={selfName}
              avatarUrl={selfAvatarUrl}
            />
          ) : (
            <Messageothers
              key={message._id || message.createdAt || message.text}
              message={message.text}
              name={getSenderName(message.sender)}
              time={message.createdAt}
              avatarUrl={getSenderAvatar(message.sender) || headerAvatar}
            />
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
