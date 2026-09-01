import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { roomService } from '../../services/roomService';
import { Lock, Unlock, KeyRound } from 'lucide-react';

const SUBJECT_OPTIONS = ['DSA', 'DBMS', 'Web Dev', 'Operating Systems', 'System Design', 'AI & ML', 'Computer Networks', 'General Study'];

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('DSA');
  const [customSubject, setCustomSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a room name');
      return;
    }

    if (isPrivate && !passcode.trim()) {
      setError('Please set a secret passcode for your private study room');
      return;
    }

    const finalSubject = subject === 'Other' ? (customSubject.trim() || 'General Study') : subject;

    try {
      setLoading(true);
      setError('');
      const res = await roomService.createRoom({
        name: name.trim(),
        subject: finalSubject,
        description: description.trim(),
        isPrivate,
        passcode: isPrivate ? passcode.trim() : null
      });

      setName('');
      setDescription('');
      setCustomSubject('');
      setIsPrivate(false);
      setPasscode('');
      onRoomCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Study Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Room Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. LeetCode Blind 75 Sprint"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject / Domain <span className="text-rose-500">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
            <option value="Other">Custom Subject...</option>
          </select>

          {subject === 'Other' && (
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Enter subject name"
              className="mt-2 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will your group focus on? (e.g., daily mock interviews, code reviews)"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
          />
        </div>

        {/* Private Room Option */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <Lock className="w-4 h-4 text-amber-600" />
              ) : (
                <Unlock className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="text-xs font-semibold text-slate-800">Private Room (Invite/Friends Only)</div>
                <div className="text-[11px] text-slate-500">Only friends with the passcode can join.</div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {isPrivate && (
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                Room Passcode <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required={isPrivate}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. 7788"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Create Study Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;
