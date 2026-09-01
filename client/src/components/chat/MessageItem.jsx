import React, { useState } from 'react';
import { Copy, Check, FileText, Download, ExternalLink, Code } from 'lucide-react';
import Modal from '../common/Modal';

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const MessageItem = ({ message, isOwnMessage }) => {
  const [copied, setCopied] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCode = message.type === 'CODE' && message.codeSnippet?.code;
  const isImage = message.type === 'IMAGE' && message.file?.url;
  const isFile = message.type === 'FILE' && message.file?.url;

  const initial = (message.senderUsername || 'U').charAt(0).toUpperCase();

  return (
    <>
      <div className="flex items-start gap-3 py-2 px-1 hover:bg-slate-50/80 rounded-lg transition-colors group">
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
            isOwnMessage
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {initial}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-900">
              {message.senderUsername || 'User'}
            </span>
            {isOwnMessage && (
              <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.2 rounded">
                You
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              {formatTime(message.createdAt)}
            </span>
          </div>

          {/* Text Message */}
          {message.content && (
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Formatted Code Block */}
          {isCode && (
            <div className="mt-2 rounded-lg border border-slate-800 bg-[#0B0F19] overflow-hidden max-w-2xl shadow-xs">
              {/* Code Top Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#070A12] border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="uppercase font-semibold text-indigo-400">
                    {message.codeSnippet.language || 'code'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(message.codeSnippet.code)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet */}
              <pre className="p-3 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed max-h-72 select-text">
                <code>{message.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Image Attachment */}
          {isImage && (
            <div className="mt-2 max-w-sm">
              <div
                className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer relative group/img"
                onClick={() => setIsImageLightboxOpen(true)}
              >
                <img
                  src={message.file.url}
                  alt={message.file.originalName || 'Shared image'}
                  className="max-h-60 w-auto object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Expand
                </div>
              </div>
            </div>
          )}

          {/* PDF Document Attachment */}
          {isFile && (
            <div className="mt-2 max-w-sm">
              <a
                href={message.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs transition-all group/pdf"
              >
                <div className="w-9 h-9 rounded-md bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate group-hover/pdf:text-indigo-600">
                    {message.file.originalName || 'Document.pdf'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="font-semibold text-rose-600 uppercase">PDF</span>
                    <span>•</span>
                    <span>{formatFileSize(message.file.size)}</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-md text-slate-400 group-hover/pdf:text-slate-700 transition-colors shrink-0">
                  <Download className="w-4 h-4" />
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {isImage && (
        <Modal
          isOpen={isImageLightboxOpen}
          onClose={() => setIsImageLightboxOpen(false)}
          title={message.file.originalName || 'Image Preview'}
          maxWidth="max-w-4xl"
        >
          <div className="flex flex-col items-center justify-center">
            <img
              src={message.file.url}
              alt={message.file.originalName}
              className="max-h-[75vh] w-auto object-contain rounded-lg border border-slate-200"
            />
            <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500">
              <span>{formatFileSize(message.file.size)}</span>
              <a
                href={message.file.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Image
              </a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MessageItem;
