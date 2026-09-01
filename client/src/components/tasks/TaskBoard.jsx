import React, { useState } from 'react';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import Button from '../common/Button';

const TaskBoard = ({
  tasks = [],
  roomId,
  members = [],
  onStatusChange,
  onDeleteTask,
  onTaskCreated,
  currentUserId
}) => {
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Study Tasks</h4>
        </div>
        <Button
          size="sm"
          variant="secondary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* Progress & Filters */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600">Completion Progress</span>
            <span className="font-semibold text-slate-900">
              {completedCount} / {tasks.length} ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {status === 'ALL'
                ? `All (${tasks.length})`
                : status === 'TODO'
                ? `Todo (${tasks.filter((t) => t.status === 'TODO').length})`
                : status === 'IN_PROGRESS'
                ? `In Progress (${tasks.filter((t) => t.status === 'IN_PROGRESS').length})`
                : `Done (${completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-[340px] max-h-[520px] bg-white">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <CheckSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {filter === 'ALL'
                ? 'Create tasks to assign action items and earn +10 points on completion!'
                : 'No tasks match the selected filter.'}
            </p>
            {filter === 'ALL' && (
              <div className="mt-3">
                <Button size="xs" variant="secondary" onClick={() => setIsModalOpen(true)}>
                  + Add first task
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDeleteTask}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={roomId}
        members={members}
        onTaskCreated={onTaskCreated}
      />
    </div>
  );
};

export default TaskBoard;
