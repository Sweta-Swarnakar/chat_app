import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export function RequireAuth() {
  const { ready, isAuthenticated } = useSession();

  if (!ready) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export function RedirectIfAuth({ children }) {
  const { ready, isAuthenticated } = useSession();

  if (!ready) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/app/welcome" replace /> : children;
}
