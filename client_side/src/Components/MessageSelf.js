import React from "react";
import "./styles.css";

export default function MessageSelf({ message }) {
  return (
    <div className="self-message-container">
      <div className="self-message-box">
        <p>{message}</p>
        <p className="self-time-stamp">Now</p>
      </div>
    </div>
  );
}
