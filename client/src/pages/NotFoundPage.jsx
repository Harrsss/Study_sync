import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { BookOpen, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <BookOpen className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-slate-800 mt-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The study room or page you're looking for doesn't exist or may have been removed.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
