import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, 
  CreditCard, Key, Edit3, Save, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { EmployeeProfile } from '../types';

interface ProfileTabProps {
  profile: EmployeeProfile;
  onUpdateProfile: (updated: Partial<EmployeeProfile>) => void;
}

export function ProfileTab({ profile, onUpdateProfile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form fields
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone
    });
    setIsEditing(false);
    setSuccessMsg('Your security-protected employee contact profile has been saved.');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Identity & Terminal Profile</h2>
          <p className="text-xs text-slate-500">Examine secure profile details, emergency credentials, and bank routing configurations.</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Modify Personal Settings
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Core Profile Card (Identity) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/85 rounded-3xl p-6 text-center space-y-4">
          <div className="relative inline-block">
            <img 
              src={profile.avatarUrl} 
              alt={`${profile.firstName} ${profile.lastName}`}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-3xl object-cover mx-auto border-4 border-slate-50 shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white" title="Active">
              ✓
            </span>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-slate-900">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs font-semibold text-slate-500">{profile.designation}</p>
            <p className="text-[10px] text-indigo-600 font-mono mt-1 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
              {profile.employeeId}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-650">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{profile.department}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-650">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-mono">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-650">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: <strong>{profile.joiningDate}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-650">
              <User className="w-4 h-4 text-slate-400" />
              <span>Manager: <strong>{profile.manager}</strong></span>
            </div>
          </div>
        </div>

        {/* Complete Info forms columns */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Identity Particulars */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-3 text-sm">Personal Identity Particulars</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-all">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Mobile Contact Line</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="mt-1 w-full p-2 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                ) : (
                  <span className="text-slate-800 font-medium font-mono block pt-1">{profile.phone}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Personal Email</span>
                <span className="text-slate-800 font-medium font-mono block pt-1">{profile.email}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Date of Birth</span>
                <span className="text-slate-800 font-medium block pt-1">{profile.dob}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Blood Classification</span>
                <span className="text-slate-800 font-medium font-mono block pt-1">{profile.bloodGroup}</span>
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Registered Home Address</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="mt-1 w-full p-2 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                ) : (
                  <span className="text-slate-800 font-medium block pt-1">{profile.address}</span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Backup Nodes */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-3 text-sm">Emergency Backup Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold select-all">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Contact Relation Name</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={emergencyContactName} 
                    onChange={(e) => setEmergencyContactName(e.target.value)} 
                    className="mt-1 w-full p-2 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="text-slate-800 font-medium block pt-1">{profile.emergencyContactName}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Contact Phone Line</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={emergencyContactPhone} 
                    onChange={(e) => setEmergencyContactPhone(e.target.value)} 
                    className="mt-1 w-full p-2 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                ) : (
                  <span className="text-slate-800 font-medium font-mono block pt-1">{profile.emergencyContactPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Payroll Bank Details (Secured View) */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm">Secured Bank Remmittance Account</h3>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Active
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Remmittance Bank Name</span>
                <span className="text-slate-700 font-medium block pt-1">{profile.bankName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Secured Savings Account</span>
                <span className="text-slate-700 font-medium font-mono block pt-1">{profile.bankAccountNo}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono font-sans">IFSC / routing code</span>
                <span className="text-slate-700 font-medium font-mono block pt-1">{profile.ifscCode}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Permanent Tax Pan</span>
                <span className="text-slate-700 font-medium font-mono block pt-1">{profile.panNumber}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">PF Universal Registry UAN</span>
                <span className="text-slate-700 font-medium font-mono block pt-1">{profile.uanNumber}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">State Provident Fund ID</span>
                <span className="text-slate-700 font-medium font-mono block pt-1 truncate">{profile.pfAccountNumber}</span>
              </div>
            </div>
          </div>

          {/* Form Actions footer */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPhone(profile.phone);
                  setAddress(profile.address);
                  setEmergencyContactName(profile.emergencyContactName);
                  setEmergencyContactPhone(profile.emergencyContactPhone);
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel Changes
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Commit & Secure Profile
              </button>
            </div>
          )}

        </div>

      </form>
    </div>
  );
}
