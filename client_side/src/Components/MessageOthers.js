import React from "react";
import "./styles.css";

export default function Messageothers({ name, message }) {
  return (
    <div className="other-msg-container">
      <div className="conversation-container">
        <p className="avatar-icon">{name ? name[0] : "U"}</p>
        <div className="other-text-content">
          <p className="con-title">{name || "User"}</p>
          <p className="con-last-msg">{message}</p>
          <p className="self-time-stamp">Now</p>
        </div>
      </div>
    </div>
  );
}
