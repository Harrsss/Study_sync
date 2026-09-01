import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Loader2, ArrowUpCircle, Code, Paperclip, Lock } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import api from '../../services/api';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import CodeSnippetModal from './CodeSnippetModal';

const ChatBox = ({ roomId, onlineUsers = [] }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch initial message history
  useEffect(() => {
    let isMounted = true;

    const loadInitialMessages = async () => {
      try {
        setLoadingHistory(true);
        const res = await messageService.getRoomMessages(roomId, 1, 50);
        if (isMounted) {
          setMessages(res.data);
          setHasMore(res.pagination.page < res.pagination.pages);
          setPage(1);
          setTimeout(() => scrollToBottom('auto'), 100);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    loadInitialMessages();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Handle Socket.IO events
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('joinRoom', { roomId });

    const handleReceiveMessage = (msg) => {
      if (msg.roomId?.toString() === roomId.toString()) {
        setMessages((prev) => {
          if (prev.some((m) => m._id?.toString() === msg._id?.toString())) {
            return prev;
          }
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    };

    const handleUserTyping = ({ userId, username }) => {
      if (userId?.toString() === user?._id?.toString()) return;
      setTypingUsers((prev) => {
        if (!prev.some((u) => u.userId?.toString() === userId?.toString())) {
          return [...prev, { userId, username }];
        }
        return prev;
      });
    };

    const handleUserStoppedTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId?.toString() !== userId?.toString()));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      socket.emit('leaveRoom', { roomId });
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [socket, roomId, user?._id]);

  // Load older messages
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await messageService.getRoomMessages(roomId, nextPage, 50);
      setMessages((prev) => [...res.data, ...prev]);
      setPage(nextPage);
      setHasMore(nextPage < res.pagination.pages);
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send standard text message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    if (content.length > 2000) return;

    if (!socket || !isConnected) {
      alert('Unable to send: Real-time connection is reconnecting. Please check connection.');
      return;
    }

    setSending(true);
    socket.emit('sendMessage', { roomId, content, type: 'TEXT' }, (ack) => {
      setSending(false);
      if (ack && !ack.success) {
        alert(ack.message || 'Failed to send message');
      } else {
        setInputText('');
        socket.emit('stopTyping', { roomId });
      }
    });
  };

  // Send formatted code snippet
  const handleSendCodeSnippet = (snippetPayload) => {
    if (!socket || !isConnected) {
      alert('Unable to send: Real-time connection is reconnecting.');
      return;
    }

    socket.emit('sendMessage', { roomId, ...snippetPayload }, (ack) => {
      if (ack && !ack.success) {
        alert(ack.message || 'Failed to share code snippet');
      }
    });
  };

  // File Upload (Images & PDFs)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (inputText.trim()) {
      formData.append('caption', inputText.trim());
    }

    try {
      setUploadingFile(true);
      const res = await api.post(`/rooms/${roomId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.data._id)) return prev;
          return [...prev, res.data.data];
        });
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
      setInputText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && isConnected && e.target.value.trim().length > 0) {
      socket.emit('typing', { roomId });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Room Chat</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{onlineUsers.length} online</span>
        </div>
      </div>

      {/* Messages Scroll Feed */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[340px] max-h-[520px] bg-white"
      >
        {/* Load More */}
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200/60 font-medium transition-colors"
            >
              {loadingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpCircle className="w-3 h-3" />}
              Load older messages
            </button>
          </div>
        )}

        {loadingHistory ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Start the discussion by saying hi, sharing code, or uploading study notes.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg._id}
              message={msg}
              isOwnMessage={msg.senderId?.toString() === user?._id?.toString()}
            />
          ))
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        <div ref={messagesEndRef} />
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        className="hidden"
      />

      {/* Bottom Message Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {/* Code Snippet Button */}
          <button
            type="button"
            onClick={() => setIsCodeModalOpen(true)}
            title="Share Code Snippet"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* File Attachment Button */}
          <button
            type="button"
            disabled={uploadingFile}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image or PDF"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
          >
            {uploadingFile ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          {/* Input text */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={uploadingFile ? "Uploading attachment..." : "Type a message, ask a question..."}
              maxLength={2000}
              disabled={uploadingFile}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending || uploadingFile}
              className="absolute right-1.5 p-1.5 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] text-slate-400">
          <span>Supports text, code snippets, images &amp; PDFs</span>
          <span>{inputText.length}/2000</span>
        </div>
      </form>

      {/* Code Snippet Modal */}
      <CodeSnippetModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSendSnippet={handleSendCodeSnippet}
      />
    </div>
  );
};

export default ChatBox;
