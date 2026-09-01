import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, BookOpen, Filter } from 'lucide-react';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/rooms/RoomCard';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import Button from '../components/common/Button';

const SUBJECT_FILTERS = [
  'All',
  'DSA',
  'DBMS',
  'Web Dev',
  'Operating Systems',
  'System Design',
  'AI & ML'
];

const RoomsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (search.trim()) params.search = search.trim();

      const res = await roomService.getRooms(params);
      setRooms(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedSubject, search]);

  const handleJoinRoom = async (roomId, passcode = null) => {
    try {
      await roomService.joinRoom(roomId, passcode);
      navigate(`/rooms/${roomId}`);
    } catch (err) {
      if (passcode) {
        throw err;
      } else {
        alert(err.response?.data?.message || 'Failed to join room');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Study Rooms
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Join a collaborative room or create one for your study group
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Room
        </Button>
      </div>

      {/* Controls: Search & Subject Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {SUBJECT_FILTERS.map((subject) => {
            const isSelected = selectedSubject === subject;
            return (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading study rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No study rooms found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || selectedSubject !== 'All'
              ? 'Try adjusting your search or subject filters.'
              : 'Create the first study room and invite classmates to study together.'}
          </p>
          <div className="mt-4">
            <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Room
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              currentUserId={user?._id}
              onJoin={handleJoinRoom}
            />
          ))}
        </div>
      )}

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

export default RoomsPage;
