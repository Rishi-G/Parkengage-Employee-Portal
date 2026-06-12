import React, { useState } from 'react';
import { 
  Wrench, Send, CheckCircle2, AlertTriangle, AlertCircle, FileText, 
  User, Clock, ShieldCheck, CornerDownRight, PlusCircle, Laptop,
  Activity, ArrowUpCircle, MessageSquare
} from 'lucide-react';
import { SupportTicket, SupportTicketReply } from '../types';

interface SupportTabProps {
  tickets: SupportTicket[];
  onAddTicket: (category: string, title: string, description: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => void;
  onAddReply: (ticketId: string, content: string) => void;
}

export function SupportTab({ tickets, onAddTicket, onAddReply }: SupportTabProps) {
  const [category, setCategory] = useState<'Hardware Terminal Error' | 'Software bug' | 'IT Access & Credentials' | 'HR Query' | 'Facilities / Parking Gate'>('Hardware Terminal Error');
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
      setErrorText('Please provide a descriptive title and detailed summary of the incident.');
      return;
    }

    onAddTicket(category, title, description, priority);
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

    onAddReply(selectedTicketId, replyText);
    setReplyText('');

    // Simulate agent reply after a tiny timeout to make the micro frontend feel alive
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (ticket) {
      setTimeout(() => {
        const greetings = [
          "I am analyzing the low-level diagnostic logs for this node path.",
          "Our technician team at the local base has been notified of this error.",
          "Your GCP BigQuery permissions are pending HR authorization. Processing takes up to 24 hours.",
          "Ticket updated. Running remote ping sweep of the network gateway IP check."
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        onAddReply(selectedTicketId, `[Auto-Diagnostic Agent response]: ${randomGreeting}`);
      }, 1500);
    }
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // States
  const totalOpen = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const totalResolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Helpdesk & Operational Support</h2>
          <p className="text-xs text-slate-500">Lodge IT issues, check terminal telemetry reports, and communicate with support representatives.</p>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Incident Backlog</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{totalOpen} Open</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Resolved Incidents</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{totalResolved} Solved</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-4 shadow-xs col-span-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Service Level Agreement (SLA)</div>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Average First Response Time: <strong className="text-indigo-600">14 minutes</strong></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Incident List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-semibold text-xs uppercase text-slate-400 tracking-wider">Submitted Tickets</h3>
          {tickets.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">
              No support tickets filed yet.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTicketId(t.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedTicketId === t.id
                    ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start gap-2 w-full">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    t.priority === 'Critical' 
                      ? 'bg-red-500 text-white' 
                      : t.priority === 'High' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.priority} priority
                  </span>
                  <span className={`text-[10px] font-mono ${selectedTicketId === t.id ? 'text-slate-400' : 'text-slate-400'}`}>
                    {t.id}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm leading-snug line-clamp-1">{t.title}</h4>
                  <p className={`text-xs mt-1 font-sans line-clamp-1 ${selectedTicketId === t.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.category}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100/10 w-full text-[10px]">
                  <span className={selectedTicketId === t.id ? 'text-slate-400' : 'text-slate-400'}>
                    Last Update: {t.lastUpdated}
                  </span>
                  <span className={`font-bold uppercase ${
                    t.status === 'Open' ? 'text-amber-500' : t.status === 'In Progress' ? 'text-indigo-400' : 'text-emerald-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </button>
            ))
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-1.5 text-xs text-slate-650">
            <h4 className="font-bold text-slate-800">IT Emergency Helpline</h4>
            <p className="text-[11px] leading-relaxed">
              If you have a critical hardware lockout or server drop causing total station downtime:
            </p>
            <p className="font-mono font-bold text-indigo-700">Call Dial-Node IP: 10-2491-03</p>
          </div>
        </div>

        {/* Detailed Ticket Discussion Inspector & Replies */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTicket ? (
            <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Ticket Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono">Category: {selectedTicket.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] text-slate-400">Filed on {selectedTicket.appliedDate}</span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-slate-950 mt-1">{selectedTicket.title}</h3>
                </div>
                
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedTicket.status === 'Open' 
                      ? 'bg-amber-50 text-amber-700' 
                      : selectedTicket.status === 'In Progress'
                      ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Status: {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 bg-slate-50 rounded-2xl border text-xs leading-relaxed text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900 border-b pb-1.5">Incident Report Description:</p>
                <p>{selectedTicket.description}</p>
                {selectedTicket.assignedTo && (
                  <p className="text-[10px] text-slate-400 pt-2 font-medium">
                    ASSIGNED AGENT: <strong className="text-slate-600 font-mono">{selectedTicket.assignedTo}</strong>
                  </p>
                )}
              </div>

              {/* Replies Thread */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Discussion Conversation Log</span>
                </h4>
                
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {!selectedTicket.replies || selectedTicket.replies.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes or replies added to this ticket yet.</p>
                  ) : (
                    selectedTicket.replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className={`p-3.5 rounded-2xl border text-xs max-w-lg ${
                          reply.role === 'Employee' 
                            ? 'bg-indigo-50/40 border-indigo-100 ml-auto' 
                            : 'bg-slate-50 border-slate-150 mr-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="font-bold text-slate-900">
                            {reply.author} <span className="text-[9px] font-medium text-slate-400">({reply.role})</span>
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">{reply.timestamp}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{reply.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter support note or response statement..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center text-slate-400 text-xs">
              Select an active support incident from the queue sidebar.
            </div>
          )}

          {/* New Ticket Form Box */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display font-semibold text-slate-900 text-sm">Raise Operational Incident</h3>
              <p className="text-xs text-slate-500 mt-1">Lodge a new hardware failure, software bug, or IT security request.</p>
            </div>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Incident Tracked Successfully</p>
                  <p>Support ticket has been created and logged in the ParkEngage ticket database.</p>
                </div>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>{errorText}</p>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="tkt-cat">
                    Incident Classification
                  </label>
                  <select
                    id="tkt-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Hardware Terminal Error">Hardware Terminal Error (Gate reader, validator)</option>
                    <option value="Software bug">Software bug (Dashboard error, validation freeze)</option>
                    <option value="IT Access & Credentials">IT Access & Credentials (API key, catalog roles)</option>
                    <option value="Facilities / Parking Gate">Facilities / Parking Gate (Sensor blocks, structural)</option>
                    <option value="HR Query">HR Query (Payroll logs, insurance updates)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="tkt-priority">
                    Priority Tier
                  </label>
                  <select
                    id="tkt-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Low">Low Priority (General question, minor optimization)</option>
                    <option value="Medium">Medium Priority (SOP questions, single device glitches)</option>
                    <option value="High">High Priority (Active station failure, client-facing blockages)</option>
                    <option value="Critical">Critical Priority (Complete system downtime, corporate lockouts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="tkt-title">
                  Incident Title Heading
                </label>
                <input
                  id="tkt-title"
                  type="text"
                  required
                  placeholder="e.g., Terminal 4D scanner fails to validate QR ticket codes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="tkt-desc">
                  Incident Description Brief
                </label>
                <textarea
                  id="tkt-desc"
                  required
                  rows={3}
                  placeholder="Provide precise hardware/software telemetry details, environment variables, or error annotations."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Lodge Incident SLA Ticket
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
