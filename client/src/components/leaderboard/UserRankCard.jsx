import React from 'react';
import { Trophy, Zap, Award, User } from 'lucide-react';

const UserRankCard = ({ userRank }) => {
  if (!userRank) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-5 shadow-xl glow-indigo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              Your Current Standing
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {userRank.username}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6 self-end sm:self-auto">
          {/* Rank */}
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Rank</div>
            <div className="text-2xl font-black text-white">
              #{userRank.rank || '-'}
            </div>
          </div>

          {/* Points */}
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Score</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1">
              <Zap className="w-5 h-5 fill-amber-300" />
              {userRank.points ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRankCard;
