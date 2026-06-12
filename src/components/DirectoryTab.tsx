import React, { useState } from 'react';
import { 
  Search, Mail, Phone, MapPin, Building, Globe, CheckCircle2, AlertCircle, 
  ChevronRight, ExternalLink, Filter, ShieldAlert, X, MessageSquare 
} from 'lucide-react';
import { DirectoryUser } from '../types';

interface DirectoryTabProps {
  directory: DirectoryUser[];
}

export function DirectoryTab({ directory }: DirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);

  // Departments List
  const departments = ['All', 'Global Operations', 'Product Engineering', 'Finance & Accounts', 'Customer Success'];

  const filteredStaff = directory.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || user.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Corporate Directory & Nodes</h2>
          <p className="text-xs text-slate-500">Coordinate with staff teammates, examine current directory nodes, and view team status logs.</p>
        </div>
      </div>

      {/* Search & Departments select filter bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by full name, ID alignment, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wide shrink-0">Departments:</span>
          <div className="flex gap-1">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {dept === 'All' ? 'All Staff' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Teammates Grid list */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl text-sm text-slate-400">
              No staff teammates matched search queries.
            </div>
          ) : (
            filteredStaff.map((user) => (
              <div 
                key={user.employeeId}
                onClick={() => setSelectedUser(user)}
                className={`p-5 rounded-2xl border text-left bg-white transition-all cursor-pointer flex items-start gap-4 hover:shadow-md hover:border-slate-300 ${
                  selectedUser?.employeeId === user.employeeId 
                    ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-sm' 
                    : 'border-slate-200/85'
                }`}
              >
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                />
                
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{user.fullName}</h4>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 truncate">{user.designation}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{user.department}</p>
                  
                  <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1.5 pt-1">
                    <span>Examine details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected User Details Sidebar Inspector Card */}
        <div className="lg:col-span-4">
          {selectedUser ? (
            <div className="bg-white border border-zinc-200/85 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
              <button 
                onClick={() => setSelectedUser(null)}
                type="button"
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 pt-2">
                <img 
                  src={selectedUser.avatarUrl} 
                  alt={selectedUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-indigo-100 shadow-sm"
                />
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">{selectedUser.fullName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedUser.designation}</p>
                  <span className="text-[10px] text-slate-400 font-mono font-bold mt-1 inline-block bg-slate-100 px-2 py-0.5 rounded">
                    {selectedUser.employeeId}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4 text-xs font-semibold">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Operations Department</span>
                  <p className="text-slate-800 text-sm font-medium pt-0.5">{selectedUser.department}</p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Secure Email Address</span>
                  <a 
                    href={`mailto:${selectedUser.email}`} 
                    className="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-mono pt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {selectedUser.email}
                  </a>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Secure Direct Phone Line</span>
                  <a 
                    href={`tel:${selectedUser.phone}`} 
                    className="text-slate-700 hover:underline flex items-center gap-1 font-mono pt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {selectedUser.phone}
                  </a>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Terminal Duty Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] mt-1 font-extrabold ${
                    selectedUser.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-orange-50 text-orange-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${selectedUser.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                    {selectedUser.status === 'Active' ? 'Checked In (Active)' : 'Checked Out (Out-of-office)'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-center transition-all flex items-center justify-center gap-1 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-bold"
                >
                  <Mail className="w-4 h-4" />
                  Email Client
                </a>

                <button
                  onClick={() => alert(`Establishing secure enterprise call to ${selectedUser.fullName}...`)}
                  type="button"
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-center transition-all flex items-center justify-center gap-1 cursor-pointer text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Message
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center text-slate-400 text-xs">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Select any teammate card to open complete details inspector.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
