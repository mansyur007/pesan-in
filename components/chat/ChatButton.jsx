'use client';

import { useState } from 'react';
import ChatPanel from './ChatPanel';
import { useChatUnread } from './useChatUnread';

// Tombol chat 💬 dengan badge pesan belum terbaca + panel chat terintegrasi.
export default function ChatButton({
  orderId,
  myRole,
  peerName,
  peerAvatar,
  active = true,
  className = 'grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200',
}) {
  const [open, setOpen] = useState(false);
  const { unread, markRead } = useChatUnread(orderId, myRole, { active: active && !open });

  function openChat() {
    markRead();
    setOpen(true);
  }
  function closeChat() {
    markRead();
    setOpen(false);
  }

  return (
    <>
      <button onClick={openChat} className={`relative ${className}`} aria-label="Chat">
        💬
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <ChatPanel
          orderId={orderId}
          myRole={myRole}
          peerName={peerName}
          peerAvatar={peerAvatar}
          onClose={closeChat}
        />
      )}
    </>
  );
}
