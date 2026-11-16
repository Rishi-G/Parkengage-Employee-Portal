import React, { useEffect, useState } from 'react';
import { Megaphone, Search, Calendar, CheckCircle2, Check } from 'lucide-react';
import { Announcement } from '../types';
import { DB_KEYS, readCollection, writeCollection } from '../data/dbRepository';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  isSuperAdmin?: boolean;
  onAddAnnouncement?: (
    title: string,
    content: string,
    category: 'General' | 'Urgent' | 'Policy' | 'Celebration'
  ) => void;
}

export function AnnouncementsTab({
  announcements,
  isSuperAdmin = false,
  onAddAnnouncement
}: AnnouncementsTabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Persisted acknowledgements
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>(() =>
    readCollection<Record<string, boolean>>(DB_KEYS.acknowledgedAnnouncements, {})
  );

  useEffect(() => {
    writeCollection(DB_KEYS.acknowledgedAnnouncements, acknowledgedIds);
  }, [acknowledgedIds]);

  // Super-Admin form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'General' | 'Urgent' | 'Policy' | 'Celebration'>('General');
  const [newContent, setNewContent] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    if (onAddAnnouncement) {
      onAddAnnouncement(newTitle.trim(), newContent.trim(), newCategory);
      setNewTitle('');
      setNewContent('');
      setNewCategory('General');
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    }
  };

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = ['All', 'General', 'Urgent', 'Policy', 'Celebration'];

  const filtered = announcements.filter((ann) => {
    const q = search.toLowerCase();
    const matchesSearch =
      ann.title.toLowerCase().includes(q) ||
      ann.content.toLowerCase().includes(q) ||
      ann.postedBy.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || ann.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-zinc-200 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
            Corporate Broadcast Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Review company-wide bulletins, policy notices, and operational updates.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
          {Object.values(acknowledgedIds).filter(Boolean).length} / {announcements.length} acknowledged
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 text-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                Broadcast Operations
              </span>
              <h3 className="text-base font-bold font-display">Publish Workspace Announcement</h3>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              Admin Broadcast
            </span>
          </div>

          {publishSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Announcement published and visible across the corporate broadcast feed.</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4 text-xs font-semibold text-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Bulletin Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Office Infrastructure Upgrade"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 text-white placeholder-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Classification Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as 'General' | 'Urgent' | 'Policy' | 'Celebration')
                  }
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 text-white font-sans"
                >
                  <option value="General">General Notice</option>
                  <option value="Urgent">Urgent Alert</option>
                  <option value="Policy">Policy Update</option>
                  <option value="Celebration">Celebration Bulletin</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Detailed Message Content
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide announcement details, effective dates, and required action items..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 text-white font-sans leading-relaxed placeholder-zinc-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm uppercase tracking-wider font-mono"
              >
                <Megaphone className="w-3.5 h-3.5" />
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search broadcast announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wide shrink-0">
            Filter:
          </span>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-dashed rounded-3xl text-slate-400 dark:text-zinc-500 text-sm">
            No bulletins matched the selected filters.
          </div>
        ) : (
          filtered.map((ann) => {
            const isAcked = !!acknowledgedIds[ann.id];
            return (
              <div
                key={ann.id}
                className={`p-6 rounded-3xl border bg-white dark:bg-zinc-900 transition-all hover:shadow-md ${
                  ann.category === 'Urgent'
                    ? 'border-rose-200 dark:border-rose-900/50'
                    : ann.category === 'Policy'
                    ? 'border-indigo-200 dark:border-indigo-900/50'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ann.category === 'Urgent'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                            : ann.category === 'Policy'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
                            : ann.category === 'Celebration'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono leading-none flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ann.date}
                      </span>
                    </div>

                    <h3 className="font-bold font-display text-base text-slate-950 dark:text-white">
                      {ann.title}
                    </h3>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    Author: <strong className="text-slate-700 dark:text-zinc-200">{ann.postedBy}</strong>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                  {ann.content}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 gap-3 flex-wrap">
                  <span className="font-mono">Broadcast ID: {ann.id} &bull; Corporate Notice</span>
                  <button
                    type="button"
                    onClick={() => toggleAcknowledge(ann.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      isAcked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                        : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                    }`}
                  >
                    {isAcked ? (
                      <>
                        <Check className="w-3 h-3" /> Acknowledged
                      </>
                    ) : (
                      <>Acknowledge receipt &rarr;</>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
