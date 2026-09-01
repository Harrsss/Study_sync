import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, ArrowRight, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';

const getSubjectVariant = (subject = '') => {
  const s = subject.toLowerCase();
  if (s.includes('dsa') || s.includes('algo')) return 'indigo';
  if (s.includes('web') || s.includes('react')) return 'purple';
  if (s.includes('dbms') || s.includes('sql')) return 'emerald';
  if (s.includes('os') || s.includes('system')) return 'amber';
  if (s.includes('ai') || s.includes('ml')) return 'rose';
  return 'slate';
};

const RoomCard = ({ room, currentUserId, onJoin }) => {
  const navigate = useNavigate();
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [joining, setJoining] = useState(false);

  const isMember = room.members?.some((m) => {
    const mId = typeof m === 'object' ? m._id : m;
    return mId?.toString() === currentUserId?.toString();
  });

  const isCreator = (typeof room.createdBy === 'object' ? room.createdBy._id : room.createdBy)?.toString() === currentUserId?.toString();

  const handleAction = () => {
    if (isMember) {
      navigate(`/rooms/${room._id}`);
    } else if (room.isPrivate) {
      setIsPasscodeModalOpen(true);
    } else {
      onJoin(room._id);
    }
  };

  const handleJoinWithPasscode = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError('Please enter the room passcode');
      return;
    }

    try {
      setJoining(true);
      setPasscodeError('');
      await onJoin(room._id, passcode.trim());
      setIsPasscodeModalOpen(false);
    } catch (err) {
      setPasscodeError(err.response?.data?.message || 'Incorrect room passcode');
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group">
        <div>
          {/* Header Tag & Member count */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={getSubjectVariant(room.subject)} size="sm">
                {room.subject}
              </Badge>
              {room.isPrivate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                  <Lock className="w-3 h-3 text-amber-600" /> Private
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.members?.length || 1} members</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            {room.name}
            {isCreator && (
              <span title="You created this room">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              </span>
            )}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {room.description || 'Collaborative study space for peer discussions and task tracking.'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
            Host: <span className="text-slate-700 font-medium">{typeof room.createdBy === 'object' ? room.createdBy?.username : 'Host'}</span>
          </div>

          <Button
            size="sm"
            variant={isMember ? 'primary' : room.isPrivate ? 'secondary' : 'secondary'}
            onClick={handleAction}
            icon={isMember ? ArrowRight : room.isPrivate ? Lock : CheckCircle2}
          >
            {isMember ? 'Enter Room' : room.isPrivate ? 'Unlock' : 'Join Room'}
          </Button>
        </div>
      </div>

      {/* Private Room Passcode Modal */}
      <Modal
        isOpen={isPasscodeModalOpen}
        onClose={() => {
          setIsPasscodeModalOpen(false);
          setPasscode('');
          setPasscodeError('');
        }}
        title="Enter Room Passcode"
      >
        <form onSubmit={handleJoinWithPasscode} className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This study room is private. Please enter the passcode provided by the room host.</span>
          </div>

          {passcodeError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {passcodeError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Secret Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="e.g. 7788"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setIsPasscodeModalOpen(false)} disabled={joining}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={joining} icon={Lock}>
              Unlock &amp; Join
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default RoomCard;
