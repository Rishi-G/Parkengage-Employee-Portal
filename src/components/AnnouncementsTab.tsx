import React, { useState } from 'react';
import { Megaphone, Search, Filter, Sparkles, BookOpen, Clock, Tag, Calendar } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsTabProps {
  announcements: Announcement[];
}

export function AnnouncementsTab({ announcements }: AnnouncementsTabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'General', 'Urgent', 'Policy', 'Celebration'];

  const filtered = announcements.filter((ann) => {
    const matchesSearch = ann.title.toLowerCase().includes(search.toLowerCase()) || 
                          ann.content.toLowerCase().includes(search.toLowerCase()) ||
                          ann.postedBy.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || ann.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Corporate Broadcast Ledger</h2>
          <p className="text-xs text-slate-500">Examine central notices, system migration bulletins, and organizational compliance parameters.</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search broadcast announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wide shrink-0">Tags:</span>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
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
          <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-3xl text-slate-400 text-sm">
            No bulletins matched the filters.
          </div>
        ) : (
          filtered.map((ann) => (
            <div 
              key={ann.id} 
              className={`p-6 rounded-3xl border bg-white transition-all hover:shadow-md ${
                ann.category === 'Urgent' 
                  ? 'border-rose-100 bg-rose-50/5' 
                  : ann.category === 'Policy'
                  ? 'border-indigo-150 bg-indigo-50/5'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      ann.category === 'Urgent' 
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : ann.category === 'Policy'
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        : ann.category === 'Celebration'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono leading-none flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ann.date}
                    </span>
                  </div>

                  <h3 className="font-bold font-display text-base text-slate-950">{ann.title}</h3>
                </div>

                <div className="text-[10px] text-slate-500 font-medium">
                  Author: <strong className="text-slate-700">{ann.postedBy}</strong>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 leading-relaxed font-sans prose max-w-none">
                {ann.content}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Direct Authorization Node IP &bull; Secure Broadcast ID: {ann.id}</span>
                <span className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5 font-semibold">
                  Acknowledge receipt
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
