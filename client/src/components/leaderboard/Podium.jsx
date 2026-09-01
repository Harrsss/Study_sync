import React from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';

const Podium = ({ topThree = [] }) => {
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  if (!first) return null;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 my-8 px-4">
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[180px]">
          <div className="relative mb-2 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-400/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xl text-slate-300">
                {second.username?.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="absolute -top-3 bg-slate-400 text-slate-950 font-extrabold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Medal className="w-3 h-3" /> #2
            </div>
          </div>
          <span className="font-bold text-sm text-slate-200 truncate max-w-full">{second.username}</span>
          <span className="text-xs font-semibold text-slate-400">{second.points} pts</span>
          <div className="w-full h-24 sm:h-28 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-700/60 to-slate-900/80 border-t-2 border-slate-400/50 flex items-center justify-center text-slate-400 font-extrabold text-2xl">
            2
          </div>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="flex flex-col items-center flex-1 max-w-[160px] sm:max-w-[200px] -mt-6">
          <div className="relative mb-2 flex flex-col items-center">
            <Crown className="w-7 h-7 text-amber-400 animate-bounce mb-1 drop-shadow" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-0.5 shadow-xl shadow-amber-500/25">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-amber-300">
                {first.username?.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <Trophy className="w-3.5 h-3.5" /> #1
            </div>
          </div>
          <span className="font-extrabold text-base text-amber-300 truncate max-w-full mt-1">{first.username}</span>
          <span className="text-sm font-bold text-amber-400/90">{first.points} pts</span>
          <div className="w-full h-32 sm:h-36 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-500/20 to-slate-900/90 border-t-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-3xl shadow-lg shadow-amber-500/10">
            1
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[180px]">
          <div className="relative mb-2 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg shadow-amber-700/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xl text-amber-600">
                {third.username?.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="absolute -top-3 bg-amber-700 text-amber-100 font-extrabold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Medal className="w-3 h-3" /> #3
            </div>
          </div>
          <span className="font-bold text-sm text-slate-200 truncate max-w-full">{third.username}</span>
          <span className="text-xs font-semibold text-slate-400">{third.points} pts</span>
          <div className="w-full h-20 sm:h-24 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-900/40 to-slate-900/80 border-t-2 border-amber-700/50 flex items-center justify-center text-amber-700 font-extrabold text-2xl">
            3
          </div>
        </div>
      )}
    </div>
  );
};

export default Podium;
