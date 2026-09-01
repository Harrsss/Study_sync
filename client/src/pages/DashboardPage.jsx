import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Plus,
  Lock,
  Clock,
  Circle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/roomService';
import { leaderboardService } from '../services/leaderboardService';
import api from '../services/api';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CreateRoomModal from '../components/rooms/CreateRoomModal';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'HIGH':
      return <Badge variant="rose" size="sm">High</Badge>;
    case 'MEDIUM':
      return <Badge variant="amber" size="sm">Medium</Badge>;
    default:
      return <Badge variant="slate" size="sm">Low</Badge>;
  }
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch rooms
        const roomsRes = await roomService.getRooms();
        const allRooms = roomsRes.data || [];
        const myJoinedRooms = allRooms.filter((r) =>
          r.members?.some((m) => {
            const mId = typeof m === 'object' ? m._id : m;
            return mId?.toString() === user?._id?.toString();
          })
        );
        setRooms(myJoinedRooms);

        // Fetch recent tasks from joined rooms
        if (myJoinedRooms.length > 0) {
          const taskPromises = myJoinedRooms.slice(0, 4).map((r) =>
            api.get(`/rooms/${r._id}/tasks`).catch(() => ({ data: { data: [] } }))
          );
          const taskResults = await Promise.all(taskPromises);
          const combinedTasks = taskResults.flatMap((res, index) => {
            const rTasks = res.data?.data || [];
            return rTasks.map((t) => ({ ...t, roomName: myJoinedRooms[index].name, roomId: myJoinedRooms[index]._id }));
          });
          setTasks(combinedTasks.slice(0, 6));
        }

        // Fetch user rank
        const rankRes = await leaderboardService.getMyRank();
        if (rankRes.data) {
          setUserRank(rankRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?._id]);

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.username || 'Student'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Continue studying where you left off.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/rooms')}
          >
            Browse Rooms
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Room
          </Button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Study Rooms & Tasks (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: My Study Rooms */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Study Rooms
                </h2>
              </div>
              <Link
                to="/rooms"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="text-sm font-medium text-slate-700">No study rooms yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Join an existing room or create your own to start collaborating with classmates.
                </p>
                <div className="mt-4">
                  <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    Create your first room
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.slice(0, 4).map((room) => (
                  <div
                    key={room._id}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {room.name}
                        </span>
                        <Badge variant="indigo" size="sm">
                          {room.subject}
                        </Badge>
                        {room.isPrivate && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                      </div>
                      {room.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{room.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {room.members?.length || 1}
                      </span>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => navigate(`/rooms/${room._id}`)}
                      >
                        Enter →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Recent Tasks */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recent Tasks
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active tasks found in your study rooms.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task._id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`font-medium truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          in {task.roomName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getPriorityBadge(task.priority)}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progress & Fast Links (1 span) */}
        <div className="space-y-6">
          {/* Student Progress Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Your Progress
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600 font-medium">Current Points</span>
                <span className="text-base font-bold text-indigo-600">
                  {userRank?.points ?? user?.points ?? 0} pts
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600 font-medium">Leaderboard Rank</span>
                <span className="text-base font-bold text-slate-900">
                  #{userRank?.rank ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600 font-medium">Active Study Rooms</span>
                <span className="text-base font-bold text-slate-900">{rooms.length}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/leaderboard"
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>View Full Leaderboard →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={(newRoom) => {
          setRooms((prev) => [newRoom, ...prev]);
          navigate(`/rooms/${newRoom._id}`);
        }}
      />
    </div>
  );
};

export default DashboardPage;
