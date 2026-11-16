import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Mail, Briefcase, Calendar, ShieldCheck,
  Edit3, Save, CheckCircle2, AlertCircle,
  Camera, X, Upload, Link, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { EmployeeProfile } from '../types';
import { Avatar } from './ui/Avatar';

const PRESET_AVATARS = [
  { name: 'Classic Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { name: 'Corporate Lead', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { name: 'Senior Staff Engineer', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
  { name: 'UX Designer Professional', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
  { name: 'Engineering Manager', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Operations Lead Analyst', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
  { name: 'Consulting Executive', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
  { name: 'Product Director', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }
];

interface ProfileTabProps {
  profile: EmployeeProfile;
  onUpdateProfile: (updated: Partial<EmployeeProfile>) => void;
}

export function ProfileTab({ profile, onUpdateProfile }: ProfileTabProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form fields
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone);

  // Sync local form state when active profile updates externally
  useEffect(() => {
    setPhone(profile.phone);
    setAddress(profile.address);
    setEmergencyContactName(profile.emergencyContactName);
    setEmergencyContactPhone(profile.emergencyContactPhone);
  }, [profile]);

  // Photo Upload States
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTab, setPhotoTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Escape closes photo modal
  useEffect(() => {
    if (!isPhotoModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPhotoModalOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPhotoModalOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone
    });
    setIsEditing(false);
    setSuccessMsg('Your employee contact profile has been saved.');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUrlError('Unsupported format. Please select a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUrlError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setUrlError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ avatarUrl: reader.result });
        setSuccessMsg('Profile picture updated successfully!');
        setIsPhotoModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePresetSelect = (url: string) => {
    onUpdateProfile({ avatarUrl: url });
    setSuccessMsg('Profile picture updated from presets successfully!');
    setIsPhotoModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) {
      setUrlError('Please enter a valid URL.');
      return;
    }

    if (
      !customUrlInput.startsWith('http://') &&
      !customUrlInput.startsWith('https://') &&
      !customUrlInput.startsWith('data:image/')
    ) {
      setUrlError('URL must begin with http://, https:// or be a base64 image data URL.');
      return;
    }

    onUpdateProfile({ avatarUrl: customUrlInput.trim() });
    setCustomUrlInput('');
    setUrlError('');
    setIsPhotoModalOpen(false);
    setSuccessMsg('Profile picture updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetDefault = () => {
    const defaultUrl =
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
    onUpdateProfile({ avatarUrl: defaultUrl });
    setSuccessMsg('Profile picture reset to default.');
    setIsPhotoModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
            Identity &amp; Employee Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            View profile details, emergency contacts, and verified payroll bank routing.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold transition-colors rounded-xl text-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Contact Details
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Core Profile Card (Identity) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-sm transition-colors duration-300">
          <div className="relative inline-block group">
            <Avatar
              src={profile.avatarUrl}
              name={fullName}
              className="w-28 h-28 rounded-3xl mx-auto border-4 border-slate-50 dark:border-zinc-800 shadow-md group-hover:scale-[1.02] transition-transform duration-300 text-2xl"
            />
            {/* Hover Camera Overlay button */}
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              type="button"
              className="absolute inset-0 bg-black/45 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white cursor-pointer"
              title="Change profile picture"
            >
              <div className="p-2 bg-black/40 rounded-xl hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
            </button>
            <span
              className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
              title="Active"
            >
              ✓
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight">
              {fullName}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {profile.designation}
            </p>
            <div className="pt-1 flex flex-wrap justify-center gap-2">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-900/40 tabular-nums">
                {profile.employeeId}
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="text-[10px] text-slate-600 dark:text-zinc-300 font-bold bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-slate-400" />
                Change Photo
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
              <Briefcase className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>{profile.department}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
              <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="font-mono truncate block">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>
                Joined: <strong>{profile.joiningDate}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
              <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="min-w-0">
                Manager: <strong className="block truncate mt-0.5">{profile.manager}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Complete Info forms columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity Particulars */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-display font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 text-sm">
              Personal Identity Particulars
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Mobile Contact Line
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                ) : (
                  <span className="text-slate-800 dark:text-zinc-300 font-medium font-mono tabular-nums block pt-1">
                    {profile.phone}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Corporate Email
                </span>
                <span className="text-slate-800 dark:text-zinc-300 font-medium font-mono block pt-1 truncate">
                  {profile.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Date of Birth
                </span>
                <span className="text-slate-800 dark:text-zinc-300 font-medium font-mono tabular-nums block pt-1">
                  {profile.dob}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Blood Group
                </span>
                <span className="text-slate-800 dark:text-zinc-300 font-medium font-mono block pt-1">
                  {profile.bloodGroup}
                </span>
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Registered Home Address
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                ) : (
                  <span className="text-slate-800 dark:text-zinc-300 font-medium block pt-1">
                    {profile.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Backup Contact */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-display font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 text-sm">
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Contact Name &amp; Relation
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="mt-1 w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="text-slate-800 dark:text-zinc-300 font-medium block pt-1">
                    {profile.emergencyContactName}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Contact Phone Line
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="mt-1 w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                ) : (
                  <span className="text-slate-800 dark:text-zinc-300 font-medium font-mono tabular-nums block pt-1">
                    {profile.emergencyContactPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payroll Bank Details (Secured View) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                Verified Payroll Bank Account
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-900/40">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Verified Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Bank Name
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium block pt-1">
                  {profile.bankName}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Account Number
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium font-mono tabular-nums block pt-1">
                  {profile.bankAccountNo}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  IFSC / Routing Code
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium font-mono block pt-1">
                  {profile.ifscCode}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Permanent Account Number (PAN)
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium font-mono block pt-1">
                  {profile.panNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  PF Universal UAN
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium font-mono tabular-nums block pt-1">
                  {profile.uanNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                  Provident Fund ID
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium font-mono block pt-1 truncate">
                  {profile.pfAccountNumber}
                </span>
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Cancel Changes
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Contact Profile
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Profile Picture Change Modal */}
      {isMounted &&
        isPhotoModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={() => setIsPhotoModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
                    Update Profile Picture
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-semibold">
                    Updates your avatar across all portal views.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Tab Toggles */}
                <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoTab('upload');
                      setUrlError('');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-center text-[10px] font-bold uppercase transition-colors tracking-wider cursor-pointer ${
                      photoTab === 'upload'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-transparent'
                    }`}
                  >
                    <Upload className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoTab('preset');
                      setUrlError('');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-center text-[10px] font-bold uppercase transition-colors tracking-wider cursor-pointer ${
                      photoTab === 'preset'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-transparent'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoTab('url');
                      setUrlError('');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-center text-[10px] font-bold uppercase transition-colors tracking-wider cursor-pointer ${
                      photoTab === 'url'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-transparent'
                    }`}
                  >
                    <Link className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
                    Link URL
                  </button>
                </div>

                {/* Error Warning */}
                {urlError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{urlError}</span>
                  </div>
                )}

                {photoTab === 'upload' && (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors relative ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="avatar-upload-input"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-400 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Drag &amp; drop your file here, or{' '}
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">
                          browse
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                        Supports JPG, PNG, WebP or SVG up to 5MB
                      </p>
                    </div>
                  </div>
                )}

                {photoTab === 'preset' && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider font-mono">
                      Select a preset portrait
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = profile.avatarUrl === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => handlePresetSelect(preset.url)}
                            className={`relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 aspect-square cursor-pointer hover:scale-[1.04] active:scale-[0.98] transition-all group ${
                              isSelected
                                ? 'border-indigo-600'
                                : 'border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                            title={preset.name}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white uppercase bg-indigo-600 shadow-md px-1.5 py-0.5 rounded-full">
                                  Active
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {photoTab === 'url' && (
                  <form onSubmit={handleUrlSubmit} className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase font-mono tracking-wider">
                      Paste Image URL
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="flex-1 p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Link className="w-3.5 h-3.5" />
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      Ensure the URL points directly to an accessible image file.
                    </p>

                    {customUrlInput.trim() && (
                      <div className="border border-slate-200 dark:border-zinc-800 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 text-center">
                        <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase font-mono">
                          Preview
                        </span>
                        <img
                          src={customUrlInput}
                          alt="URL Preview"
                          onError={() =>
                            setUrlError(
                              'Failed to resolve image URL. Check target source privacy or link spelling.'
                            )
                          }
                          onLoad={() => setUrlError('')}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl mx-auto object-cover border border-slate-200 dark:border-zinc-800 shadow-sm"
                        />
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-transparent border-none p-1 cursor-pointer flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Default Photo
                </button>

                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
