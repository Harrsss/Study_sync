import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';
import Badge from '../common/Badge';

const getRankBadge = (rank) => {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
        🥇 1st
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
        🥈 2nd
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100/60 text-amber-900 border border-amber-300">
        🥉 3rd
      </span>
    );
  }
  return <span className="font-semibold text-slate-500">#{rank}</span>;
};

const LeaderboardTable = ({ users = [], currentUserId }) => {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        No students ranked on the leaderboard yet. Complete study tasks to earn points!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="py-3 px-4 w-20">Rank</th>
            <th className="py-3 px-4">Student</th>
            <th className="py-3 px-4 text-right">Points</th>
            <th className="py-3 px-4 text-right w-28">Standing</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const isMe = user.userId?.toString() === currentUserId?.toString();
            return (
              <tr
                key={user.userId || user.rank}
                className={`transition-colors ${
                  isMe
                    ? 'bg-indigo-50/70 font-semibold text-indigo-950'
                    : 'hover:bg-slate-50/80 text-slate-800'
                }`}
              >
                {/* Rank */}
                <td className="py-3 px-4">
                  <div className="flex items-center">{getRankBadge(user.rank)}</div>
                </td>

                {/* User */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isMe
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 truncate">
                        {user.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-indigo-600 text-sm">
                    {user.points} pts
                  </span>
                </td>

                {/* Standing */}
                <td className="py-3 px-4 text-right">
                  {user.rank <= 3 ? (
                    <Badge variant={user.rank === 1 ? 'amber' : user.rank === 2 ? 'slate' : 'amber'} size="sm">
                      Top 3
                    </Badge>
                  ) : user.rank <= 10 ? (
                    <Badge variant="indigo" size="sm">Top 10</Badge>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Scholar</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
