import React from "react";
import "./styles.css";
import { formatChatTime } from "../utils/time";

const renderAvatar = (name, avatarUrl) => {
  if (avatarUrl) {
    return <img className="message-avatar" src={avatarUrl} alt={name || "User"} />;
  }

  return <p className="avatar-icon message-avatar-fallback">{name ? name[0] : "U"}</p>;
};

export default function Messageothers({ name, message, time, avatarUrl }) {
  return (
    <div className="other-msg-container">
      <div className="message-avatar-wrap">
        {renderAvatar(name || "User", avatarUrl)}
      </div>
      <div className="other-text-content">
        <p className="con-title">{name || "User"}</p>
        <p className="con-last-msg">{message}</p>
        <p className="self-time-stamp">{formatChatTime(time)}</p>
      </div>
    </div>
  );
}
