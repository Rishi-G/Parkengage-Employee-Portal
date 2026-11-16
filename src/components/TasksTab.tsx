import React, { useState } from 'react';
import {
  Plus, CheckCircle2, AlertCircle, Calendar,
  Filter, CheckCircle, PlayCircle, Trash2, Sparkles
} from 'lucide-react';
import { WorkTask, EmployeeProfile } from '../types';

interface TasksTabProps {
  tasks: WorkTask[];
  onAddTask: (title: string, description: string, project: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => void;
  onUpdateTaskStatus: (id: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  isSuperAdmin?: boolean;
  allProfiles?: EmployeeProfile[];
  onAdminUpdateTasks?: (updated: WorkTask[]) => void;
}

export function TasksTab({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  isSuperAdmin = false,
  onAdminUpdateTasks
}: TasksTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Operational Excellence');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!title.trim() || !description.trim() || !dueDate) {
      setErrorText('Please provide a title, description, and due date.');
      return;
    }

    onAddTask(title.trim(), description.trim(), project, priority, dueDate);
    setIsSuccess(true);
    setTitle('');
    setDescription('');
    setDueDate('');
    setProject('Operational Excellence');
    setPriority('Medium');

    setTimeout(() => setIsSuccess(false), 3500);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeFilter === 'All' || task.status === activeFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Tasks &amp; Deliverables</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Track sprint objectives, update task status, and create new deliverables.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
            {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFilter === st
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none text-slate-700 dark:text-zinc-200 font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-sm text-slate-400 dark:text-zinc-500">
              No tasks match your filters. Create a task from the panel on the right.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-zinc-900 border text-sm rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between min-h-[196px] ${
                    task.status === 'Completed'
                      ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono truncate">
                          {task.project}
                        </span>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => onAdminUpdateTasks?.(tasks.filter(t => t.id !== task.id))}
                            className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40'
                            : task.priority === 'Medium'
                            ? 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h3
                      className={`font-bold font-display text-sm ${
                        task.status === 'Completed'
                          ? 'line-through text-slate-400 dark:text-zinc-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        task.status === 'Completed'
                          ? 'text-slate-400 dark:text-zinc-500'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 mt-4 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">{task.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {task.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start Task
                        </button>
                      )}

                      {task.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Complete
                        </button>
                      )}

                      {task.status === 'Completed' && (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'Pending')}
                          title="Click to reopen task"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] cursor-pointer hover:opacity-80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <div id="add-task-form" className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Create Task</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Add a new work item or project deliverable.</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Task created</p>
                <p>Added to your active deliverables board.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="task-title-input">
                Task Title
              </label>
              <input
                id="task-title-input"
                type="text"
                required
                placeholder="e.g. Recalibrate Dispatch Metrics"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="project-category">
                Project Stream
              </label>
              <select
                id="project-category"
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Operational Excellence">Operational Excellence</option>
                <option value="Terminal Health Integration">Terminal Health Integration</option>
                <option value="Global Reporting System">Global Reporting System</option>
                <option value="SOP Standardization">SOP Standardization</option>
                <option value="Security Logs Auditing">Security Logs Auditing</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="task-priority-select">
                  Priority
                </label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="task-due-date">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="task-desc">
                Description
              </label>
              <textarea
                id="task-desc"
                required
                rows={3}
                placeholder="Describe acceptance criteria and key steps..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-900/40 rounded-2xl flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
              High-priority tasks appear on your main Workspace overview for quick status updates.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
