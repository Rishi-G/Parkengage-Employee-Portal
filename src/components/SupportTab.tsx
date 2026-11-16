import React, { useState } from 'react';
import {
  Send, CheckCircle2, AlertCircle, ShieldCheck,
  PlusCircle, Activity, MessageSquare
} from 'lucide-react';
import { SupportTicket, SupportTicketReply, EmployeeProfile } from '../types';

interface SupportTabProps {
  tickets: SupportTicket[];
  onAddTicket: (
    category: string,
    title: string,
    description: string,
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  ) => string | void;
  onAddReply: (
    ticketId: string,
    content: string,
    authorName?: string,
    roleOverride?: SupportTicketReply['role']
  ) => void;
  isSuperAdmin?: boolean;
  allProfiles?: EmployeeProfile[];
  onAdminUpdateTickets?: (updated: SupportTicket[]) => void;
}

export function SupportTab({
  tickets,
  onAddTicket,
  onAddReply,
  isSuperAdmin = false,
  onAdminUpdateTickets
}: SupportTabProps) {
  const [category, setCategory] = useState<
    | 'Hardware Terminal Error'
    | 'Software bug'
    | 'IT Access & Credentials'
    | 'HR Query'
    | 'Facilities / Parking Gate'
  >('Hardware Terminal Error');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!title.trim() || !description.trim()) {
      setErrorText('Please provide a descriptive title and detailed summary of the issue.');
      return;
    }

    const newId = onAddTicket(category, title.trim(), description.trim(), priority);
    if (typeof newId === 'string') {
      setSelectedTicketId(newId);
    }
    setIsSuccess(true);
    setTitle('');
    setDescription('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 4500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    onAddReply(selectedTicketId, replyText.trim());
    setReplyText('');

    const targetTicketId = selectedTicketId;
    const ticket = tickets.find((t) => t.id === targetTicketId);
    if (ticket && !isSuperAdmin) {
      setTimeout(() => {
        const greetings = [
          'Thank you — we are inspecting the diagnostic logs for this issue.',
          'Our local IT technician team has been notified and assigned.',
          'Access request queued for HR/IT approval. Typical turnaround is within 24 hours.',
          'Ticket updated. Running remote diagnostics on the endpoint.'
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        onAddReply(targetTicketId, randomGreeting, 'IT Support Desk', 'Support Agent');
      }, 1200);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const totalOpen = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const totalResolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
            Helpdesk &amp; Operational Support
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Raise IT or HR tickets, follow live resolution updates, and contact support representatives.
          </p>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Active Queue
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              {totalOpen} Open
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Resolved Tickets
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              {totalResolved} Solved
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-xs col-span-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Service Level Agreement (SLA)
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate mt-0.5">
              Average First Response Time:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">14 minutes</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Incident List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-semibold text-xs uppercase text-slate-400 dark:text-zinc-500 tracking-wider">
            Submitted Tickets
          </h3>
          {tickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-400 dark:text-zinc-500">
              No support tickets filed yet.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-colors flex flex-col gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-indigo-950/60 border-slate-950 dark:border-indigo-500/60 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 w-full">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'Critical'
                          ? 'bg-rose-500 text-white'
                          : t.priority === 'High'
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {t.priority} priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400 tabular-nums">
                      {t.id}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm leading-snug line-clamp-1">{t.title}</h4>
                    <p
                      className={`text-xs mt-1 font-sans line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {t.category}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/20 dark:border-zinc-800 w-full text-[10px]">
                    <span className="text-slate-400 tabular-nums">Updated: {t.lastUpdated}</span>
                    <span
                      className={`font-bold uppercase ${
                        t.status === 'Open'
                          ? 'text-amber-500'
                          : t.status === 'In Progress'
                          ? 'text-indigo-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </button>
              );
            })
          )}

          <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
            <h4 className="font-bold text-slate-800 dark:text-white">IT Emergency Helpline</h4>
            <p className="text-[11px] leading-relaxed">
              For urgent hardware lockouts or service interruptions affecting operations:
            </p>
            <p className="font-mono font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
              Internal Desk Ext: 10-2491-03
            </p>
          </div>
        </div>

        {/* Detailed Ticket Discussion Inspector & Replies */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTicket ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Ticket Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {selectedTicket.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                      Filed on {selectedTicket.appliedDate}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white mt-1">
                    {selectedTicket.title}
                  </h3>
                </div>

                <div className="shrink-0 flex items-center gap-2 flex-wrap">
                  {isSuperAdmin && selectedTicket.status !== 'Resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = tickets.map((t) =>
                          t.id === selectedTicket.id ? { ...t, status: 'Resolved' as const } : t
                        );
                        onAdminUpdateTickets?.(updated);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedTicket.status === 'Open'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        : selectedTicket.status === 'In Progress'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    Status: {selectedTicket.status}
                  </span>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="p-3 bg-slate-900 dark:bg-zinc-950 border border-slate-800 text-white rounded-2xl flex items-center gap-2.5 text-xs shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-400 font-mono text-[10px] uppercase tracking-wider">
                      Admin Support Review Mode
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Replies sent here are posted with administrative support attribution.
                    </p>
                  </div>
                </div>
              )}

              {/* Description Body */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-1.5">
                  Incident Description:
                </p>
                <p>{selectedTicket.description}</p>
                {selectedTicket.assignedTo && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 pt-2 font-medium">
                    ASSIGNED TO:{' '}
                    <strong className="text-slate-600 dark:text-zinc-300 font-mono">
                      {selectedTicket.assignedTo}
                    </strong>
                  </p>
                )}
              </div>

              {/* Replies Thread */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-xs uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <span>Conversation Log</span>
                </h4>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {!selectedTicket.replies || selectedTicket.replies.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                      No notes or replies added to this ticket yet.
                    </p>
                  ) : (
                    selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3.5 rounded-2xl border text-xs max-w-lg ${
                          reply.role === 'Employee'
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-900/40 ml-auto'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 mr-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {reply.author}{' '}
                            <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                              ({reply.role})
                            </span>
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 dark:text-zinc-500 tabular-nums">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter support note or response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 text-xs px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-dashed rounded-3xl p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
              Select a support ticket from the queue to view details.
            </div>
          )}

          {/* New Ticket Form Box */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
                Raise Support Ticket
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Report a hardware issue, software bug, or IT access request.
              </p>
            </div>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Ticket Created</p>
                  <p>Your support request has been logged and selected above.</p>
                </div>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p>{errorText}</p>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                    htmlFor="tkt-cat"
                  >
                    Category
                  </label>
                  <select
                    id="tkt-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Hardware Terminal Error">Hardware Terminal Error</option>
                    <option value="Software bug">Software Bug</option>
                    <option value="IT Access & Credentials">IT Access &amp; Credentials</option>
                    <option value="Facilities / Parking Gate">Facilities / Parking Gate</option>
                    <option value="HR Query">HR Query</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                    htmlFor="tkt-priority"
                  >
                    Priority
                  </label>
                  <select
                    id="tkt-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                  htmlFor="tkt-title"
                >
                  Subject
                </label>
                <input
                  id="tkt-title"
                  type="text"
                  required
                  placeholder="e.g., Terminal 4D scanner fails to validate QR codes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-zinc-500"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                  htmlFor="tkt-desc"
                >
                  Description
                </label>
                <textarea
                  id="tkt-desc"
                  required
                  rows={3}
                  placeholder="Provide details, device location, or steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans placeholder-slate-400 dark:placeholder-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Support Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
