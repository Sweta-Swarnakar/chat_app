import React from "react";
import "./styles.css";
import { formatChatTime } from "../utils/time";

const renderAvatar = (name, avatarUrl) => {
  if (avatarUrl) {
    return <img className="message-avatar" src={avatarUrl} alt={name || "Me"} />;
  }

  return <p className="avatar-icon message-avatar-fallback">{name ? name[0] : "U"}</p>;
};

export default function MessageSelf({ message, time, name, avatarUrl }) {
  return (
    <div className="self-message-container">
      <div className="self-message-box">
        <p>{message}</p>
        <p className="self-time-stamp">{formatChatTime(time)}</p>
      </div>
      <div className="message-avatar-wrap self-message-avatar">
        {renderAvatar(name || "Me", avatarUrl)}
      </div>
    </div>
  );
}
