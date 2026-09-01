import React from 'react';
import { BookOpen, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070A12] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">StudySync</span>
          <span>&copy; {new Date().getFullYear()} — Production Collaborative Study Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Built with React, Express, MongoDB &amp; Redis
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
