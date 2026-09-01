import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  User,
  LogOut,
  Plus,
  BookOpen,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roomService } from '../../services/roomService';
import CreateRoomModal from '../rooms/CreateRoomModal';

const Sidebar = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [myRooms, setMyRooms] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMyRooms = async () => {
      try {
        const res = await roomService.getRooms();
        if (isMounted && res.data) {
          const userRooms = res.data.filter((r) =>
            r.members?.some((m) => {
              const mId = typeof m === 'object' ? m._id : m;
              return mId?.toString() === user?._id?.toString();
            })
          );
          setMyRooms(userRooms.slice(0, 5));
        }
      } catch (err) {
        // Silently fail or ignore in background
      }
    };

    if (user?._id) {
      fetchMyRooms();
    }

    return () => {
      isMounted = false;
    };
  }, [user?._id, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Study Rooms', path: '/rooms', icon: Users },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy }
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight"
          >
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold">StudySync</span>
          </NavLink>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-0.5">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* My Study Rooms Quick List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                My Rooms
              </span>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                title="Create new room"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {myRooms.length === 0 ? (
              <p className="px-2 py-1 text-xs text-slate-400 italic">No rooms joined yet</p>
            ) : (
              myRooms.map((room) => (
                <NavLink
                  key={room._id}
                  to={`/rooms/${room._id}`}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                    <span className="truncate">{room.name}</span>
                  </div>
                  {room.isPrivate && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user?.username || 'Student'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user?.points || 0} pts
                </div>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={(newRoom) => {
          setMyRooms((prev) => [newRoom, ...prev.slice(0, 4)]);
          navigate(`/rooms/${newRoom._id}`);
        }}
      />
    </>
  );
};

export default Sidebar;
