import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, Circle, AlertCircle, Calendar, Tag, 
  Clock, CheckSquare, Sparkles, Filter, CheckCircle, Send, PlayCircle 
} from 'lucide-react';
import { WorkTask } from '../types';

interface TasksTabProps {
  tasks: WorkTask[];
  onAddTask: (title: string, description: string, project: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => void;
  onUpdateTaskStatus: (id: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
}

export function TasksTab({ tasks, onAddTask, onUpdateTaskStatus }: TasksTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Operational Excellence');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Filtering state
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!title.trim() || !description.trim() || !dueDate) {
      setErrorText('Please provide a title, description and valid target completion date.');
      return;
    }

    onAddTask(title, description, project, priority, dueDate);
    setIsSuccess(true);

    // Reset Form
    setTitle('');
    setDescription('');
    setDueDate('');
    setProject('Operational Excellence');
    setPriority('Medium');

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = activeFilter === 'All' || task.status === activeFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Active Workspaces & Backlogs</h2>
          <p className="text-xs text-slate-500">Document progress milestones, launch terminal actions, and map team dependencies in real time.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-500 font-semibold font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Target:</span>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveFilter(st as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeFilter === st 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority Only</option>
            <option value="Medium">Medium Priority Only</option>
            <option value="Low">Low Priority Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Objectives Board */}
        <div className="lg:col-span-8 space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl text-sm text-slate-400">
              No tasks matched selected system filters. Use the create panel to launch a new workflow target!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`bg-white border text-sm rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between min-h-[200px] ${
                    task.status === 'Completed' 
                      ? 'border-emerald-100/80 bg-emerald-50/5' 
                      : 'border-slate-200/85'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {task.project}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        task.priority === 'High' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : task.priority === 'Medium'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <h3 className={`font-bold font-display text-slate-900 text-sm ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    <p className={`text-xs text-slate-500 leading-relaxed ${task.status === 'Completed' ? 'text-slate-400' : ''}`}>
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-150/50 mt-4 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px]">{task.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {task.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-all flex items-center gap-1 cursor-pointer text-[10px]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Launch Action
                        </button>
                      )}
                      
                      {task.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-55 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold transition-all flex items-center gap-1 cursor-pointer text-[10px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolve Code
                        </button>
                      )}

                      {task.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create target workspace target Form */}
        <div id="add-task-form" className="lg:col-span-4 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-slate-900 text-sm">Target Integration Launcher</h3>
            <p className="text-xs text-slate-500 mt-1">Append new tasks and operational backlogs.</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Workflow Targets Active</p>
                <p>Objective has been loaded into your high-performance registry queue.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="task-title-input">
                Task Title
              </label>
              <input
                id="task-title-input"
                type="text"
                required
                placeholder="e.g. Recalibrate Dispatch Sliders"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="project-category">
                Associated Workspace Category
              </label>
              <select
                id="project-category"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="task-priority-select">
                  Priority Rating
                </label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="task-due-date">
                  Due Target Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="task-desc">
                Log Description / SOP Directives
              </label>
              <textarea
                id="task-desc"
                required
                rows={3}
                placeholder="Give explicit troubleshooting actions or validation requirements for targets."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Launch Workflow Objective
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-bounce" />
            <span className="text-[10px] font-medium text-slate-600 leading-normal">
              Need assistance? Direct logs are shared instantly across high priority boards for peer operations review by VP <strong>Vishal Gupta</strong>.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
