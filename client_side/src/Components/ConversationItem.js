import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConversationItem({props}) {

  const navigate = useNavigate()
  const handleOpen = () => {
    const chatPath = props.kind === "group"
      ? `/app/chat/group:${props.id}`
      : `/app/chat/${props.id || "general"}`;

    navigate(chatPath, { state: props });
  };

  return (
    <div className='conversation-container' onClick={handleOpen}>
      {props.avatarUrl
        ? <img className="avatar-image avatar-icon" src={props.avatarUrl} alt={props.name || "chat"} />
        : <p className='avatar-icon'>{props.name?.[0] || "U"}</p>}
      <p className='con-title'>{props.name || "Chat"}</p>
      <p className='con-last-msg'>{props.lastMessage || "Tap to open"}</p>
      <p className='con-time-stamp'>{props.timeStamp || ""}</p>
    </div>
  )
}
