import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.username).join(', ');
  const text = typingUsers.length === 1 ? `${names} is typing...` : `${names} are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 italic">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
      </div>
      <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;
