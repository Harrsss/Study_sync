import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2, User } from 'lucide-react';
import Badge from '../common/Badge';

const PRIORITY_BADGES = {
  LOW: <Badge variant="slate" size="sm">Low</Badge>,
  MEDIUM: <Badge variant="amber" size="sm">Medium</Badge>,
  HIGH: <Badge variant="rose" size="sm">High</Badge>
};

const TaskCard = ({ task, onStatusChange, onDelete, currentUserId }) => {
  const isCompleted = task.status === 'COMPLETED';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isCreator = (typeof task.createdBy === 'object' ? task.createdBy._id : task.createdBy)?.toString() === currentUserId?.toString();

  const handleToggle = () => {
    let nextStatus = 'TODO';
    if (task.status === 'TODO') nextStatus = 'IN_PROGRESS';
    else if (task.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (task.status === 'COMPLETED') nextStatus = 'TODO';
    onStatusChange(task._id, nextStatus);
  };

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      isCompleted
        ? 'bg-slate-50/80 border-slate-200/80 opacity-80'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-2.5">
        {/* Toggle & Title */}
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleToggle}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
            title="Click to toggle status (Todo -> In Progress -> Completed)"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isInProgress ? (
              <Clock className="w-4 h-4 text-blue-600" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className={`text-xs font-semibold leading-snug break-words ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}>
              {task.title}
            </h4>

            {task.description && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Footer Metadata */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Status Pill */}
              <button
                type="button"
                onClick={handleToggle}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : isInProgress
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {task.status.replace('_', ' ')}
              </button>

              {/* Priority */}
              {PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM}

              {/* Assignee */}
              {task.assignedTo && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{typeof task.assignedTo === 'object' ? task.assignedTo.username : 'Member'}</span>
                </span>
              )}

              {task.pointsAwarded && isCompleted && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                  +10 pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete action */}
        {isCreator && (
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
