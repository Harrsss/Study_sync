import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Code, Send } from 'lucide-react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML / CSS' },
  { value: 'bash', label: 'Bash / Shell' }
];

const CodeSnippetModal = ({ isOpen, onClose, onSendSnippet }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please paste or write your code snippet');
      return;
    }

    onSendSnippet({
      type: 'CODE',
      content: caption.trim(),
      codeSnippet: {
        code: code.trim(),
        language
      }
    });

    setCode('');
    setCaption('');
    setError('');
    onClose();
  };

  const lineCount = code.split('\n').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Code Snippet"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right self-end pb-2 text-xs text-slate-400 font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Code Editor
          </label>
          <textarea
            rows={10}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${language} code here...`}
            className="w-full p-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-600 resize-y"
            spellCheck="false"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Optional Note / Description
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Optimized with memoization"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Send}>
            Post Snippet
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CodeSnippetModal;
