import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { clearAuthToken, getAuthToken, getUserIdFromToken, isValidAuthToken } from "../utils/authToken";
import { getApiBaseUrl } from "../services/apiClient";
import { getConversationKeyFromPath } from "../utils/conversation";
import {
  markConversationRead,
  markConversationUnread,
  resetConversationState,
  upsertConversationActivity
} from "../features/conversationSlice";
import { resetUserState, setUsersOnlineStatus } from "../features/userSlice";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const activeConversationIdRef = useRef(null);
  const [token, setToken] = useState(() => getAuthToken());
  const [ready, setReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const isAuthenticated = isValidAuthToken(token);
  const userId = useMemo(() => getUserIdFromToken(token), [token]);
  const activeConversationId = useMemo(
    () => getConversationKeyFromPath(location.pathname, userId),
    [location.pathname, userId]
  );

  useEffect(() => {
    const storedToken = getAuthToken();
    if (!isValidAuthToken(storedToken)) {
      clearAuthToken();
      setToken(null);
    } else {
      setToken(storedToken);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    if (!activeConversationId) return undefined;
    dispatch(markConversationRead(activeConversationId));
    return undefined;
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && !token) {
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    if (!token || !isValidAuthToken(token) || !userId) {
      setOnlineUsers([]);
      setConnectionStatus("disconnected");
      return undefined;
    }

    const socketClient = io(getApiBaseUrl(), {
      transports: ["websocket"]
    });

    socketRef.current = socketClient;
    setSocket(socketClient);
    setConnectionStatus("connecting");

    socketClient.on("connect", () => {
      setConnectionStatus("connected");
      socketClient.emit("join", userId);
    });

    socketClient.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socketClient.on("online_users", (users) => {
      const nextOnlineUsers = Array.isArray(users) ? users : [];
      setOnlineUsers(nextOnlineUsers);
      dispatch(setUsersOnlineStatus(nextOnlineUsers));
    });

    socketClient.on("receive_message", (incomingMessage) => {
      const message = incomingMessage?.message || incomingMessage;
      if (!message?.chatId) return;

      const timeStamp = message.createdAt
        ? new Date(message.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString();

      dispatch(upsertConversationActivity({
        conversationId: message.chatId,
        lastMessage: message.text,
        timeStamp
      }));

      if (message.chatId === activeConversationIdRef.current) {
        dispatch(markConversationRead(message.chatId));
        return;
      }

      dispatch(markConversationUnread({
        conversationId: message.chatId,
        lastMessage: message.text,
        timeStamp
      }));
    });

    return () => {
      socketClient.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [dispatch, token, userId]);

  const login = useCallback((accessToken) => {
    if (!accessToken) return;
    localStorage.setItem("chatAppToken", accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback((redirectTo = "/") => {
    clearAuthToken();
    setToken(null);
    setOnlineUsers([]);
    setConnectionStatus("disconnected");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    dispatch(resetUserState());
    dispatch(resetConversationState());
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [dispatch, navigate]);

  const emitSocketEvent = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const value = useMemo(() => ({
    ready,
    token,
    userId,
    isAuthenticated,
    connectionStatus,
    onlineUsers,
    socket,
    emitSocketEvent,
    login,
    logout
  }), [connectionStatus, emitSocketEvent, isAuthenticated, login, logout, onlineUsers, ready, socket, token, userId]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export default SessionContext;
