import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Lock,
  Share2,
  Trash2,
  LogOut,
  MessageSquare,
  CheckSquare,
  Copy,
  Check
} from 'lucide-react';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChatBox from '../components/chat/ChatBox';
import TaskBoard from '../components/tasks/TaskBoard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // For mobile: 'chat' | 'tasks'

  // Fetch Room & Tasks
  useEffect(() => {
    let isMounted = true;

    const fetchRoomAndTasks = async () => {
      try {
        setLoading(true);
        setError('');

        const roomRes = await roomService.getRoomById(roomId);
        if (!isMounted) return;
        setRoom(roomRes.data);

        const tasksRes = await api.get(`/rooms/${roomId}/tasks`);
        if (!isMounted) return;
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load study room');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomAndTasks();
    }

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Task Status Toggle
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.data : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Add Task
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    if (!window.confirm('Are you sure you want to leave this study room?')) return;
    try {
      await roomService.leaveRoom(roomId);
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave room');
    }
  };

  // Delete Room
  const handleDeleteRoom = async () => {
    if (!window.confirm('WARNING: Deleting this study room will permanently remove all messages and tasks. Continue?')) return;
    try {
      await roomService.deleteRoom(roomId);
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // Copy Room Link
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading study room workspace...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center max-w-lg mx-auto shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Room Not Accessible</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Room not found'}</p>
        <div className="mt-4">
          <Button size="sm" variant="primary" onClick={() => navigate('/rooms')}>
            Back to Study Rooms
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = (typeof room.createdBy === 'object' ? room.createdBy._id : room.createdBy)?.toString() === user?._id?.toString();

  return (
    <div className="space-y-4">
      {/* Top Workspace Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/rooms" className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> All Rooms
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">{room.subject}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {room.name}
            </h1>
            <Badge variant="indigo" size="sm">
              {room.subject}
            </Badge>
            {room.isPrivate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                <Lock className="w-3 h-3 text-amber-600" /> Private
              </span>
            )}
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {room.members?.length || 1} members
            </span>
          </div>

          {room.description && (
            <p className="text-xs text-slate-500 line-clamp-1">{room.description}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            icon={copied ? Check : Share2}
            onClick={handleCopyInvite}
          >
            {copied ? 'Link Copied' : 'Share Link'}
          </Button>

          {!isCreator ? (
            <Button
              size="sm"
              variant="outline"
              icon={LogOut}
              onClick={handleLeaveRoom}
            >
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              variant="danger"
              icon={Trash2}
              onClick={handleDeleteRoom}
            >
              Delete Room
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'chat'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Discussion
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'tasks'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Tasks ({tasks.length})
        </button>
      </div>

      {/* Workspace Grid (Desktop: Split 7/5 or 6/6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Real-Time Chat (7 cols) */}
        <div className={`lg:col-span-7 ${activeTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
          <ChatBox roomId={roomId} onlineUsers={room.members || []} />
        </div>

        {/* Right Pane: Collaborative Tasks (5 cols) */}
        <div className={`lg:col-span-5 ${activeTab === 'tasks' ? 'block' : 'hidden lg:block'}`}>
          <TaskBoard
            tasks={tasks}
            roomId={roomId}
            members={room.members || []}
            onStatusChange={handleTaskStatusChange}
            onDeleteTask={handleDeleteTask}
            onTaskCreated={handleTaskCreated}
            currentUserId={user?._id}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
