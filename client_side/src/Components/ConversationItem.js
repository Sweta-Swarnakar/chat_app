import React from 'react'
import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom'

export default function ConversationItem({ props: conversation, onDelete }) {
  const navigate = useNavigate();

  const handleOpen = () => {
    const chatPath = conversation.kind === "group"
      ? `/app/chat/group:${conversation.id}`
      : `/app/chat/${conversation.id || "general"}`;

    navigate(chatPath, { state: conversation });
  };

  return (
    <div className={`conversation-container ${conversation.isUnread ? "unread" : ""}`} onClick={handleOpen}>
      <div className="avatar-wrap">
        {conversation.avatarUrl
          ? <img className="avatar-image list-avatar" src={conversation.avatarUrl} alt={conversation.name || "chat"} />
          : <p className='avatar-icon'>{conversation.name?.[0] || "U"}</p>}
        {conversation.status ? <span className={`status-dot ${conversation.status === "Online" ? "online-dot" : "offline-dot"}`} /> : null}
      </div>
      <div className="conversation-text">
        <p className={`con-title ${conversation.isUnread ? "unread-title" : ""}`}>{conversation.name || "Chat"}</p>
        <p className='con-last-msg'>{conversation.lastMessage || "Tap to open"}</p>
      </div>
      <p className='con-time-stamp'>{conversation.timeStamp || ""}</p>
      <IconButton
        size="small"
        className="conversation-delete-btn"
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(conversation);
        }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </div>
  )
}
