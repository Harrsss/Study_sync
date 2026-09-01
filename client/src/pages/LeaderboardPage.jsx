import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Users, RefreshCw } from 'lucide-react';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import Button from '../components/common/Button';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const [topRes, rankRes] = await Promise.all([
        leaderboardService.getTopUsers(100),
        leaderboardService.getMyRank()
      ]);
      setLeaderboard(topRes.data || []);
      setMyRank(rankRes.data || null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Student rankings based on completed tasks (+10 pts each)
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={RefreshCw}
          isLoading={refreshing}
          onClick={handleRefresh}
        >
          Refresh Rankings
        </Button>
      </div>

      {/* User Standing Summary Card */}
      {myRank && (
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              #{myRank.rank}
            </div>
            <div>
              <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                Your Standing
              </div>
              <div className="text-sm font-bold text-slate-900">
                {myRank.username}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
              Total Score
            </div>
            <div className="text-base font-bold text-indigo-600">
              {myRank.points} pts
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading leaderboard rankings...
          </div>
        ) : (
          <LeaderboardTable users={leaderboard} currentUserId={user?._id} />
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
