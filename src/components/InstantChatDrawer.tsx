import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Bot, User, Paperclip, CalendarDays, Share2,
  Download, FileText, Check, Building, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from './ui/Avatar';

interface ChatMessage {
  id: string;
  sender: 'me' | 'colleague';
  text: string;
  timestamp: string;
  isBot?: boolean;
  file?: {
    name: string;
    size: string;
    type: string;
  };
  leaveRequest?: {
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: string;
  };
  infoShare?: {
    title: string;
    items: Array<{ label: string; value: string }>;
  };
}

interface InstantChatDrawerProps {
  user: {
    fullName: string;
    designation: string;
    email: string;
    phone: string;
    avatarUrl: string;
    status: string;
    department: string;
  } | null;
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserRole?: string;
  currentUserDepartment?: string;
  onClose: () => void;
  onApplyLeave: (type: string, startStr: string, endStr: string, reasonStr: string) => void;
}

const PRESET_FILES = [
  { name: 'UI_Feedback_Response_Q2.pdf', size: '1.2 MB', type: 'PDF' },
  { name: 'Vite_Build_Optimization_Spec.docx', size: '480 KB', type: 'DOCX' },
  { name: 'Ad_Campaign_Aesthetic_Asset.png', size: '2.4 MB', type: 'Image' },
  { name: 'Noida_RD_Staff_Audit.xlsx', size: '890 KB', type: 'Excel' }
];

export function InstantChatDrawer({
  user,
  currentUserName = 'Rishi Gautam',
  currentUserEmail = 'rishi.gautam@parkengage.com',
  currentUserRole = 'UI Architect and Product Design',
  currentUserDepartment = 'UI/ UX Research and development department',
  onClose,
  onApplyLeave
}: InstantChatDrawerProps) {
  const [isBotActive, setIsBotActive] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'file' | 'leave' | 'info'>('none');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Leave Form Local State
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-06-26');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when a new colleague is opened
  useEffect(() => {
    if (!user) return;
    setMessages([
      {
        id: 'msg-init-1',
        sender: 'colleague',
        text: `Automated Assistant for ${user.fullName}:\nHello! I am the automated assistant for ${user.fullName}. I can help with status updates, shared documents, or leave coordination while they are away.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isBot: true
      },
      {
        id: 'msg-init-2',
        sender: 'colleague',
        text: 'To switch to a direct message thread, toggle "AI Assistant" off above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isBot: true
      }
    ]);
    setIsBotActive(true);
    setActivePanel('none');
    setLeaveSubmitted(false);
    setDownloadNotice(null);
  }, [user]);

  // Scroll to bottom whenever messages grow
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Escape closes drawer
  useEffect(() => {
    if (!user) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [user, onClose]);

  if (!user) return null;

  const handleDownloadAttachment = (file: { name: string; size: string; type: string }) => {
    const content = [
      'ParkEngage Workspace Document',
      `File: ${file.name}`,
      `Format: ${file.type}`,
      `Size: ${file.size}`,
      `Conversation Partner: ${user.fullName} (${user.designation})`,
      `Exported: ${new Date().toISOString()}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Downloaded ${file.name}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleSendMessage = async (customMessage?: ChatMessage) => {
    const textToSend = customMessage ? '' : inputText.trim();
    if (!customMessage && !textToSend) return;

    const newMessage: ChatMessage = customMessage || {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.leaveRequest
              ? `[Leave Request Submitted: ${m.leaveRequest.days} Days ${m.leaveRequest.type}] ${m.text}`
              : m.file
              ? `[Dispatched File attachment: ${m.file.name}] ${m.text}`
              : m.text
          })),
          personName: user.fullName,
          personRole: user.designation,
          isBotActive,
          senderName: currentUserName,
          senderRole: currentUserRole
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error('Chat backend unavailable');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-res-${Date.now()}`,
          sender: 'colleague',
          text: data.text || "Received. Let's review this during our next sync!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: isBotActive
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-res-fallback-${Date.now()}`,
          sender: 'colleague',
          text: isBotActive
            ? `Auto-Reply: Logged your note ("${newMessage.text}") for ${user.fullName}.`
            : `Direct Message: Got your note ("${newMessage.text}"). I'll follow up shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: isBotActive
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShareFile = (file: (typeof PRESET_FILES)[0]) => {
    const fileMessage: ChatMessage = {
      id: `msg-file-${Date.now()}`,
      sender: 'me',
      text: `Shared document: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
    handleSendMessage(fileMessage);
    setActivePanel('none');
  };

  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffMs = endObj.getTime() - startObj.getTime();
    const days = diffMs >= 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1 : 1;

    onApplyLeave(leaveType, startDate, endDate, leaveReason);

    const leaveMessage: ChatMessage = {
      id: `msg-leave-${Date.now()}`,
      sender: 'me',
      text: `Submitted a ${days}-day ${leaveType} Leave request (${startDate} to ${endDate}). Reason: ${leaveReason}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leaveRequest: {
        type: leaveType,
        startDate,
        endDate,
        days,
        reason: leaveReason,
        status: 'Pending'
      }
    };

    handleSendMessage(leaveMessage);
    setLeaveReason('');
    setLeaveSubmitted(true);
    setTimeout(() => {
      setActivePanel('none');
      setLeaveSubmitted(false);
    }, 2000);
  };

  const handleShareInfo = (topic: string) => {
    let items: Array<{ label: string; value: string }> = [];
    let text = '';

    if (topic === 'contact') {
      text = 'Shared corporate contact card.';
      items = [
        { label: 'Staff Name', value: currentUserName },
        { label: 'Department', value: currentUserDepartment },
        { label: 'Role', value: currentUserRole },
        { label: 'Corporate Email', value: currentUserEmail }
      ];
    } else if (topic === 'tasks') {
      text = 'Shared active deliverables summary.';
      items = [
        { label: 'Design Guide V2', value: 'Completed (95%)' },
        { label: 'UI Audit & Polish', value: 'In Progress' },
        { label: 'Sprint Planning', value: 'Verified' }
      ];
    } else if (topic === 'attendance') {
      text = 'Shared daily attendance status.';
      items = [
        { label: 'Daily Status', value: 'Present' },
        { label: 'Clock-In Time', value: '08:58 AM' },
        { label: 'Work Mode', value: 'Sector 63 Office' }
      ];
    }

    const infoMessage: ChatMessage = {
      id: `msg-info-${Date.now()}`,
      sender: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      infoShare: {
        title:
          topic === 'contact'
            ? 'Corporate Contact Card'
            : topic === 'tasks'
            ? 'Active Deliverables'
            : 'Daily Attendance Status',
        items
      }
    };

    handleSendMessage(infoMessage);
    setActivePanel('none');
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      {/* Dimmed backdrop background */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col pointer-events-auto">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                src={user.avatarUrl}
                name={user.fullName}
                className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 ${
                  user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </div>

            <div className="text-left min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {user.fullName}
              </h4>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                {user.designation}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium font-mono leading-none mt-0.5 truncate">
                {user.department}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat drawer"
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messaging Mode Controller */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/70 to-slate-50 dark:from-indigo-950/30 dark:to-zinc-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isBotActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isBotActive ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">
                {isBotActive ? 'AI Assistant Active' : 'Direct Message Mode'}
              </span>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-none">
                {isBotActive
                  ? 'Automated assistant responding on their behalf.'
                  : 'Sending direct messages to colleague.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
              AI Assistant:
            </span>
            <button
              type="button"
              onClick={() => {
                const nextState = !isBotActive;
                setIsBotActive(nextState);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `sys-${Date.now()}`,
                    sender: 'colleague',
                    text: nextState
                      ? 'AI Auto-Responder enabled for this conversation.'
                      : 'Switched to direct messaging mode.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isBot: false
                  }
                ]);
              }}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer border ${
                isBotActive
                  ? 'bg-indigo-600 border-indigo-500 shadow-xs'
                  : 'bg-slate-300 border-slate-400 dark:bg-zinc-800 dark:border-zinc-700'
              }`}
              title={isBotActive ? 'Switch to direct messaging' : 'Enable AI assistant'}
            >
              <span className="sr-only">Toggle AI Assistant</span>
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center transition-transform duration-200 shadow-sm ${
                  isBotActive ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {isBotActive ? (
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                ) : (
                  <X className="w-2.5 h-2.5 text-slate-500" />
                )}
              </span>
            </button>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest font-mono min-w-[20px] ${
                isBotActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'
              }`}
            >
              {isBotActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {downloadNotice && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-950">
          {messages.map((msg) => {
            if (msg.id.startsWith('sys-')) {
              return (
                <div key={msg.id} className="flex justify-center my-1">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-[10px] text-slate-500 dark:text-zinc-400 font-semibold border border-slate-200 dark:border-zinc-800 font-mono tracking-wide max-w-[90%] text-center leading-relaxed flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-1 px-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500">
                    {msg.sender === 'me' ? currentUserName : user.fullName}
                  </span>
                  {msg.isBot && msg.sender === 'colleague' && (
                    <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/30 px-1 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <Bot className="w-2 h-2" /> Assistant
                    </span>
                  )}
                  {!msg.isBot && msg.sender === 'colleague' && (
                    <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 px-1 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <User className="w-2 h-2" /> Direct
                    </span>
                  )}
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    &bull; {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs text-left shadow-sm ${
                    msg.sender === 'me'
                      ? 'bg-indigo-600 dark:bg-indigo-600 text-white border border-indigo-500/20'
                      : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.file && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/15 dark:bg-white/10 border border-white/15 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 bg-rose-500 text-white rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold truncate text-[11px] leading-tight max-w-[160px]">
                            {msg.file.name}
                          </p>
                          <p className="text-[9px] opacity-80 mt-0.5">
                            {msg.file.size} &bull; {msg.file.type}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(msg.file!)}
                        title={`Download ${msg.file.name}`}
                        className="p-1.5 rounded-lg bg-white/20 dark:bg-zinc-800/60 hover:bg-white/30 dark:hover:bg-zinc-800 transition-colors shrink-0 text-[10px] font-bold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {msg.leaveRequest && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-1.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">
                          {msg.leaveRequest.type} Leave Applied
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="opacity-80 block">Duration</span>
                          <span className="font-semibold tabular-nums">
                            {msg.leaveRequest.startDate} to {msg.leaveRequest.endDate}
                          </span>
                        </div>
                        <div>
                          <span className="opacity-80 block">Total Days</span>
                          <span className="font-bold text-xs tabular-nums">
                            {msg.leaveRequest.days} {msg.leaveRequest.days === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] bg-emerald-100/70 dark:bg-emerald-900/40 p-1.5 rounded">
                        <span className="font-bold block">Reason</span>
                        <p className="italic">"{msg.leaveRequest.reason}"</p>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Synced with HR Leaves &amp; Attendance</span>
                      </div>
                    </div>
                  )}

                  {msg.infoShare && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 text-left space-y-1.5">
                      <h5 className="font-bold text-[11px] flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        {msg.infoShare.title}
                      </h5>
                      <div className="space-y-1 text-[10px]">
                        {msg.infoShare.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between border-b border-indigo-200/50 dark:border-indigo-900/30 pb-0.5 gap-2"
                          >
                            <span className="opacity-85">{it.label}:</span>
                            <span className="font-bold text-right">{it.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 mb-1 px-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500">
                  {user.fullName}
                </span>
                {isBotActive && (
                  <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1 rounded font-bold uppercase">
                    Assistant
                  </span>
                )}
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">
                  {isBotActive ? 'Drafting response...' : `${user.fullName.split(' ')[0]} is typing...`}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Feature selection panel tray */}
        <AnimatePresence>
          {activePanel !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 12 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 12 }}
              className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900 shrink-0 text-left overflow-hidden"
            >
              {activePanel === 'file' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> Select Document to Share
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActivePanel('none')}
                      className="text-xs hover:underline text-slate-400 dark:text-zinc-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_FILES.map((file, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleShareFile(file)}
                        className="p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-start gap-2 text-xs cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold truncate text-[11px] leading-tight text-slate-900 dark:text-zinc-200">
                            {file.name}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1">
                            {file.size} &bull; {file.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'leave' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Quick Leave Application
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActivePanel('none')}
                      className="text-xs hover:underline text-slate-400 dark:text-zinc-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {leaveSubmitted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-semibold py-6 justify-center">
                      <Check className="w-4 h-4 bg-emerald-500 text-white rounded-full p-0.5" />
                      <span>Leave request submitted and synced with HR!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitLeaveRequest} className="space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-zinc-400">
                            Type
                          </label>
                          <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100"
                          >
                            <option value="Casual">Casual</option>
                            <option value="Sick">Sick</option>
                            <option value="Earned">Earned</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-zinc-400">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-zinc-400">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold block mb-1 text-slate-600 dark:text-zinc-400">
                          Reason
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Medical checkup or personal work"
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Submit Leave Request
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activePanel === 'info' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Share Profile Summary
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActivePanel('none')}
                      className="text-xs hover:underline text-slate-400 dark:text-zinc-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareInfo('contact')}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors cursor-pointer text-center"
                    >
                      <Building className="w-4 h-4 mx-auto mb-1.5 text-indigo-500" />
                      <span className="font-bold text-[10px]">Contact Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareInfo('tasks')}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors cursor-pointer text-center"
                    >
                      <FileText className="w-4 h-4 mx-auto mb-1.5 text-amber-500" />
                      <span className="font-bold text-[10px]">Task Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareInfo('attendance')}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors cursor-pointer text-center"
                    >
                      <CalendarDays className="w-4 h-4 mx-auto mb-1.5 text-emerald-500" />
                      <span className="font-bold text-[10px]">Clock-In Info</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActivePanel(activePanel === 'file' ? 'none' : 'file')}
                title="Share Document"
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  activePanel === 'file'
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-transparent'
                }`}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActivePanel(activePanel === 'leave' ? 'none' : 'leave')}
                title="Request Leave"
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  activePanel === 'leave'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-transparent'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActivePanel(activePanel === 'info' ? 'none' : 'info')}
                title="Share Summary"
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  activePanel === 'info'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-400'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-transparent'
                }`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isBotActive ? "Message colleague's assistant..." : 'Write a direct message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-center mt-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono font-bold leading-none">
              Encrypted Workspace Messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
