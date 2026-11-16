import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Upload, AlertCircle, ArrowRight,
  ShieldAlert, Check, FileCheck, Users, Heart, Phone, Award, Edit3, X, Save, CheckCircle2
} from 'lucide-react';

import { EmployeeProfile } from '../types';
import { DB_KEYS, getSeedCollection, readCollection, writeCollection } from '../data/dbRepository';

interface OnboardingDocRule {
  id: string;
  title: string;
  docType: string;
  validTill: string;
  expiresDate: string;
  isMandatory: boolean;
}

interface OnboardingTabProps {
  profile?: EmployeeProfile;
}

export function OnboardingTab({ profile }: OnboardingTabProps) {
  const onboardingSeed = getSeedCollection(DB_KEYS.onboardingState as 'parkengage_onboarding_state');
  const onboardingFormsSeed = getSeedCollection(DB_KEYS.onboardingForms as 'parkengage_onboarding_forms');
  const savedState = readCollection<any>(DB_KEYS.onboardingState, null);

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    savedState?.checkedItems || onboardingSeed.checkedItems
  );

  const [familyDetails, setFamilyDetails] = useState(
    savedState?.familyDetails || onboardingSeed.familyDetails
  );

  const [medicalConditions, setMedicalConditions] = useState(
    savedState?.medicalConditions || onboardingSeed.medicalConditions
  );

  const [emergencyContacts, setEmergencyContacts] = useState(
    savedState?.emergencyContacts || {
      ...onboardingSeed.emergencyContacts,
      primaryPhone: profile?.phone || onboardingSeed.emergencyContacts.primaryPhone,
      physicalAddress: profile?.address || onboardingSeed.emergencyContacts.physicalAddress,
    }
  );

  const [skillsSets, setSkillsSets] = useState(
    savedState?.skillsSets || onboardingSeed.skillsSets
  );

  const [editingSection, setEditingSection] = useState<'family' | 'medical' | 'emergency' | 'skills' | null>(null);
  const [tempFamily, setTempFamily] = useState({ ...familyDetails });
  const [tempMedical, setTempMedical] = useState({ ...medicalConditions });
  const [tempEmergency, setTempEmergency] = useState({ ...emergencyContacts });
  const [tempSkills, setTempSkills] = useState({ ...skillsSets });

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    savedState?.uploadedFiles || {}
  );
  const [formSubmitted, setFormSubmitted] = useState<boolean>(Boolean(savedState?.formSubmitted));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);
  const [adminDocRules] = useState<OnboardingDocRule[]>(() =>
    readCollection<OnboardingDocRule[]>(
      DB_KEYS.joiningFormalities,
      getSeedCollection(DB_KEYS.joiningFormalities as 'parkengage_joining_formalities') as OnboardingDocRule[]
    )
  );

  useEffect(() => {
    writeCollection(DB_KEYS.onboardingState, {
      checkedItems,
      familyDetails,
      medicalConditions,
      emergencyContacts,
      skillsSets,
      uploadedFiles,
      formSubmitted,
      employeeId: profile?.employeeId || 'PE2604045',
      employeeName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Rishi Gautam',
      updatedAt: new Date().toISOString(),
    });
  }, [checkedItems, familyDetails, medicalConditions, emergencyContacts, skillsSets, uploadedFiles, formSubmitted, profile?.employeeId, profile?.firstName, profile?.lastName]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingSection) setEditingSection(null);
        else if (previewOpen) setPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingSection, previewOpen]);

  const showNotice = (message: string) => {
    setNoticeBanner(message);
    setTimeout(() => {
      setNoticeBanner(prev => (prev === message ? null : prev));
    }, 3500);
  };

  const openEditModal = (section: 'family' | 'medical' | 'emergency' | 'skills') => {
    if (formSubmitted) return;
    if (section === 'family') setTempFamily({ ...familyDetails });
    else if (section === 'medical') setTempMedical({ ...medicalConditions });
    else if (section === 'emergency') setTempEmergency({ ...emergencyContacts });
    else if (section === 'skills') setTempSkills({ ...skillsSets });
    setEditingSection(section);
  };

  const saveEditModal = () => {
    if (editingSection === 'family') {
      setFamilyDetails(tempFamily);
      setCheckedItems(prev => ({ ...prev, family_details: true }));
    } else if (editingSection === 'medical') {
      setMedicalConditions(tempMedical);
      setCheckedItems(prev => ({ ...prev, medical_condition: true }));
    } else if (editingSection === 'emergency') {
      setEmergencyContacts(tempEmergency);
      setCheckedItems(prev => ({ ...prev, emergency_contacts: true }));
    } else if (editingSection === 'skills') {
      setSkillsSets(tempSkills);
      setCheckedItems(prev => ({ ...prev, skills_sets: true }));
    }
    setEditingSection(null);
    showNotice('Onboarding details saved and checklist item marked verified.');
  };

  const customRules = adminDocRules.filter(
    r => !['nda_signed', 'edu_cert', 'relieving_letter', 'salary_slips'].includes(r.id)
  );

  const fileCategories = [
    ...onboardingFormsSeed.baseFileCategories,
    ...customRules.map(r => ({ id: r.id, label: r.title }))
  ];

  const toggleCheck = (id: string) => {
    if (formSubmitted) return;
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (catId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (formSubmitted) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [catId]: file.name }));
      showNotice(`Attached file: ${file.name}`);
    }
  };

  const totalTasks = Object.keys(checkedItems).length + fileCategories.length;
  const completedTasks = Object.values(checkedItems).filter(Boolean).length + fileCategories.filter(c => Boolean(uploadedFiles[c.id])).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSubmit = () => {
    setFormSubmitted(true);
    showNotice('Onboarding packet locked and submitted for HR verification.');
  };

  const handleDownloadFile = (fileName: string, docTitle?: string) => {
    const templateText = [
      'PARKENGAGE ENTERPRISE HR — JOINING COMPLIANCE DOCUMENT PACKET',
      '==================================================================',
      `Document: ${docTitle || fileName}`,
      `Reference File: ${fileName}`,
      `Generated Date: ${new Date().toISOString().split('T')[0]}`,
      '',
      'Instructions:',
      '1. Print or digitally fill all mandatory personal & statutory fields.',
      '2. Sign on every page where Employee Signature is indicated.',
      '3. Scan and upload the completed PDF back into Onboarding Formalities.',
      '4. Retain original physical copies for verification on joining day.',
      '',
      `Declared Family Headcount: ${familyDetails.dependentsCount} dependents`,
      `Declared Emergency Primary: ${emergencyContacts.primaryName} (${emergencyContacts.primaryPhone})`,
      `Declared Blood Group: ${medicalConditions.bloodGroup}`,
      '=================================================================='
    ].join('\n');

    const safeFileName = fileName.replace(/\.(pdf|pptx)$/i, '.txt');
    const blob = new Blob([templateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', safeFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Downloaded template packet: ${safeFileName}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {noticeBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{noticeBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upper Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 p-8 md:p-10 rounded-3xl text-white shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-brand" />

        <div className="space-y-3.5 relative z-10 text-left">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Onboarding Verification Active
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white leading-tight">
            Joining Formality Compliance
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
            Complete all checklist items, download mandatory HR packets from the right panel, upload your signed copies, and preview before final submission.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-5 border border-zinc-800 text-right shrink-0 md:w-80 relative z-10 w-full">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Total Progress</span>
            <span className="text-xs font-bold text-indigo-300 font-mono tabular-nums bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800">
              {completedTasks} / {totalTasks}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-3 border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-300 font-medium text-left flex justify-between items-center bg-zinc-900/60 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-indigo-400 font-mono tabular-nums">{progressPercentage}% completed</span>
            {formSubmitted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Verified & Locked
              </span>
            ) : (
              <span className="text-zinc-400 font-mono">Editable Draft</span>
            )}
          </p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Pane */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Joining Formality Directions</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Step-by-step verification instructions and document uploads.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadFile('Sample_Onboarding_Form_Pack.pdf', 'Sample Onboarding Form Pack')}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Sample Forms
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('Joining_Formality_Guideline_v2.pptx', 'Joining Formality Guideline Deck')}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Guideline Deck
                </button>
              </div>
            </div>

            {/* Page 1 Requirements */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-light dark:bg-indigo-950/60 text-brand dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-display shadow-xs">1</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Page 1 Requirements</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Verify details align with legal identity credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Family Details */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['family_details']
                      ? 'bg-brand/5 dark:bg-indigo-950/20 border-brand/25 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('family_details');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['family_details']
                          ? 'bg-brand border-brand text-white'
                          : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['family_details'] && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" /> Family Details
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('family')}
                          disabled={formSubmitted}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-700 dark:text-zinc-200 rounded-lg border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Spouse name, dependents, and parents' legal names.</p>

                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Spouse:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.spouseName || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Father:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.fatherName || 'Not declared'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Mother:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.motherName || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Dependents:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.dependentsCount} ({familyDetails.dependentsList})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['medical_condition']
                      ? 'bg-brand/5 dark:bg-indigo-950/20 border-brand/25 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('medical_condition');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['medical_condition']
                          ? 'bg-brand border-brand text-white'
                          : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['medical_condition'] && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                          <Heart className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" /> Medical Conditions
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('medical')}
                          disabled={formSubmitted}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-700 dark:text-zinc-200 rounded-lg border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Blood group, critical allergies, health policy, and declaration.</p>

                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Blood Group:</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono truncate block">{medicalConditions.bloodGroup || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Allergies:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.allergies || 'None'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Chronic History:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.hasChronicCondition}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Mediclaim Plan:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.mediclaimCovered} ({medicalConditions.healthPolicyDetail})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['emergency_contacts']
                      ? 'bg-brand/5 dark:bg-indigo-950/20 border-brand/25 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('emergency_contacts');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['emergency_contacts']
                          ? 'bg-brand border-brand text-white'
                          : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['emergency_contacts'] && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" /> Emergency Contacts
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('emergency')}
                          disabled={formSubmitted}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-700 dark:text-zinc-200 rounded-lg border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Primary and secondary emergency phone contacts & address.</p>

                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Primary Contact:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{emergencyContacts.primaryName} ({emergencyContacts.primaryRelation})</span>
                            <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 font-bold tabular-nums block">{emergencyContacts.primaryPhone}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Secondary Contact:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{emergencyContacts.secondaryName} ({emergencyContacts.secondaryRelation})</span>
                            <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 font-bold tabular-nums block">{emergencyContacts.secondaryPhone}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-1.5 truncate">
                          <span className="text-slate-400 dark:text-zinc-500 block font-medium">Primary Residence Address:</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200 block truncate" title={emergencyContacts.physicalAddress}>{emergencyContacts.physicalAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Qualifications */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    uploadedFiles['edu_cert']
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">Educational Qualifications</span>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Self-attested scan of highest degree or diploma certificate.</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {uploadedFiles['edu_cert'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['edu_cert']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">• Scan Missing</span>
                    )}

                    <label className={`px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all shrink-0 ${formSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3 h-3 inline mr-1" /> PDF/JPG
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('edu_cert', e)}
                        className="hidden"
                        disabled={formSubmitted}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Requirements */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-light dark:bg-indigo-950/60 text-brand dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-display shadow-xs">2</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Page 2 Requirements</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Previous employer credentials, signed forms, and HR verification files.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['skills_sets']
                      ? 'bg-brand/5 dark:bg-indigo-950/20 border-brand/25 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('skills_sets');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['skills_sets']
                          ? 'bg-brand border-brand text-white'
                          : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['skills_sets'] && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                          <Award className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" /> Skill Set Declaration
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('skills')}
                          disabled={formSubmitted}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-700 dark:text-zinc-200 rounded-lg border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-normal">Core technical stacks, capability summary, and certifications.</p>

                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Core Stack:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.primaryStack}>{skillsSets.primaryStack}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Certifications:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.certifications}>{skillsSets.certifications || 'None'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Expert Skills:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.keySkills}>{skillsSets.keySkills}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 dark:text-zinc-500 block font-medium">Statement:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.capabilityStatement}>{skillsSets.capabilityStatement}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    uploadedFiles['relieving_letter']
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                      <FileCheck className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">Employment Details</span>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">(Optional for freshers) Relieving, experience, or acceptance letters.</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {uploadedFiles['relieving_letter'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['relieving_letter']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">• Optional upload</span>
                    )}

                    <label className={`px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all ${formSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3 h-3 inline mr-1" /> PDF/JPG
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('relieving_letter', e)}
                        className="hidden"
                        disabled={formSubmitted}
                      />
                    </label>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    uploadedFiles['salary_slips']
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">Previous Salary Slips</span>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Scans of the last 3 months salary slips from previous employer.</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {uploadedFiles['salary_slips'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['salary_slips']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">• Optional upload</span>
                    )}

                    <label className={`px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all ${formSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3 h-3 inline mr-1" /> PDF/ZIP
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.zip"
                        onChange={(e) => handleFileUpload('salary_slips', e)}
                        className="hidden"
                        disabled={formSubmitted}
                      />
                    </label>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    uploadedFiles['nda_signed']
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                      <FileCheck className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">Signed Forms Scan Pack</span>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">All downloaded forms from the right panel (NDA, PF, Gratuity) signed.</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {uploadedFiles['nda_signed'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['nda_signed']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">• Mandatory scan</span>
                    )}

                    <label className={`px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all ${formSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3 h-3 inline mr-1" /> Upload PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('nda_signed', e)}
                        className="hidden"
                        disabled={formSubmitted}
                      />
                    </label>
                  </div>
                </div>

                {customRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      uploadedFiles[rule.id]
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                        : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                        <FileCheck className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">{rule.title}</span>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {rule.docType} &bull; Due {rule.validTill}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {uploadedFiles[rule.id] ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles[rule.id]}
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold ${rule.isMandatory ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                          {rule.isMandatory ? '• Mandatory admin policy' : '• Optional policy doc'}
                        </span>
                      )}

                      <label className={`px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all ${formSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <Upload className="w-3 h-3 inline mr-1" /> Upload File
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(rule.id, e)}
                          className="hidden"
                          disabled={formSubmitted}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Compliance Guidelines */}
              <div className="bg-slate-50 dark:bg-zinc-950/60 rounded-2xl p-5 mt-4 space-y-3.5 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 block uppercase">Important Compliance Guidelines</span>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed list-none">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                    <div>
                      Download, fill, scan, and upload the required forms from the right panel: Joining Report, PF Form 11, ParkEngage NDA (sign all pages), Gratuity Form F, Mediclaim Form, Employment Form (BCG), ESIC Form, and PF Form 2.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                    <div>
                      <strong>Preview:</strong> Review your filled entries and uploaded files at a glance before finalizing.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                    <div>
                      Once you click <strong>Submit Final Records</strong>, your onboarding entries are locked and routed to HR review.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                    <div>
                      Bring physical hand-signed copies of these documents for verification on your joining date.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Action Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-brand dark:text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Verify your entries before locking. Once locked, HR intervention is required for edits.</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all font-bold text-xs rounded-xl cursor-pointer"
                >
                  Preview Compliance Form
                </button>
                <button
                  type="button"
                  disabled={formSubmitted}
                  onClick={handleSubmit}
                  className={`w-full sm:w-auto px-7 py-2.5 font-bold font-display text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5 ${
                    formSubmitted
                      ? 'bg-emerald-600 text-white cursor-not-allowed shadow-none'
                      : 'bg-brand hover:bg-brand-hover text-white shadow-brand/15 cursor-pointer'
                  }`}
                >
                  {formSubmitted ? (
                    <>
                      <Check className="w-4 h-4" /> Locked & Submitted
                    </>
                  ) : (
                    <>
                      Submit Final Records <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mandatory HR Forms */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-4">
              <span>Mandatory HR Forms</span>
              <span className="text-[10px] bg-brand-light dark:bg-indigo-950/60 text-brand dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-mono font-bold tabular-nums">8 Files</span>
            </h3>

            <div className="space-y-2">
              {onboardingFormsSeed.mandatoryHrForms.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDownloadFile(item.file, item.label)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-brand dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block truncate">{item.file}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Download ${item.label}`}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 group-hover:bg-brand group-hover:text-white text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 transition-all text-[11px] font-bold flex items-center gap-0.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Documents list */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-4">
              <span>Policy & Directives</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-mono font-bold">Policies</span>
            </h3>

            <div className="space-y-2">
              {onboardingFormsSeed.policyDocuments.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDownloadFile(item.file, item.label)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block truncate uppercase">{item.file}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Download ${item.label}`}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 transition-all text-[11px] font-bold flex items-center gap-0.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setPreviewOpen(false)} />
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 text-left">
            <div className="p-6 bg-slate-900 dark:bg-zinc-950 text-white flex justify-between items-center border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 block uppercase">Form Compliance Preview</span>
                <h4 className="text-lg font-bold font-display">Onboarding Form Summary Check</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl space-y-3.5 text-xs text-slate-700 dark:text-zinc-300">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 block uppercase">Submission Status</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block uppercase">Status Code:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {formSubmitted ? 'ONBOARD_V4_LOCKED' : 'ONBOARD_V4_DRAFT'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block uppercase">Completed Items:</span>
                    <span className="font-bold font-mono tabular-nums">{completedTasks} of {totalTasks} items</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 block uppercase">Mandatory Checklists</span>
                {[
                  { label: 'Family details declaration', active: checkedItems['family_details'] },
                  { label: 'Medical history & group declaration', active: checkedItems['medical_condition'] },
                  { label: 'Emergency contact channels', active: checkedItems['emergency_contacts'] },
                  { label: 'Educational diploma degree scan', active: !!uploadedFiles['edu_cert'] },
                  { label: 'Technical skills declaration', active: checkedItems['skills_sets'] },
                  { label: 'Signed NDA & HR forms pack', active: !!uploadedFiles['nda_signed'] },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{item.label}</span>
                    {item.active ? (
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3" /> MISSING
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
                  <strong>Verification Statement:</strong> By submitting final records, you certify that all uploaded files and personal declarations are accurate for HR verification.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-right">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold font-display text-xs rounded-xl cursor-pointer transition-colors"
              >
                Acknowledge Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Section Editing Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingSection(null)} />
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-xl overflow-hidden relative z-10 transition-all duration-200 text-left">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-300 block uppercase">Modify Compliance Records</span>
                <h4 className="text-lg font-bold font-display">
                  {editingSection === 'family' && 'Update Family Information'}
                  {editingSection === 'medical' && 'Configure Medical & Health Options'}
                  {editingSection === 'emergency' && 'Update Emergency Contacts'}
                  {editingSection === 'skills' && 'Declare Core Skill & Competencies'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {editingSection === 'family' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Spouse Name (if applicable)</label>
                      <input
                        type="text"
                        value={tempFamily.spouseName}
                        onChange={(e) => setTempFamily({ ...tempFamily, spouseName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Enter spouse name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={tempFamily.fatherName}
                        onChange={(e) => setTempFamily({ ...tempFamily, fatherName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Enter father's name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={tempFamily.motherName}
                        onChange={(e) => setTempFamily({ ...tempFamily, motherName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Enter mother's name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Number of Dependents</label>
                      <select
                        value={tempFamily.dependentsCount}
                        onChange={(e) => setTempFamily({ ...tempFamily, dependentsCount: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      >
                        <option value="0">None / 0</option>
                        <option value="1">1 Dependent</option>
                        <option value="2">2 Dependents</option>
                        <option value="3">3 Dependents</option>
                        <option value="4+">4+ Dependents</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Dependent Details (Names & Relation)</label>
                    <textarea
                      value={tempFamily.dependentsList}
                      onChange={(e) => setTempFamily({ ...tempFamily, dependentsList: e.target.value })}
                      className="w-full h-16 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200 resize-none"
                      placeholder="e.g. Sia Gupta (Daughter), Aarav Gupta (Son)"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'medical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Blood Group</label>
                      <select
                        value={tempMedical.bloodGroup}
                        onChange={(e) => setTempMedical({ ...tempMedical, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Critical Allergies</label>
                      <input
                        type="text"
                        value={tempMedical.allergies}
                        onChange={(e) => setTempMedical({ ...tempMedical, allergies: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="e.g. Peanuts, Penicillin (Or 'None')"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Chronic Condition History</label>
                      <select
                        value={tempMedical.hasChronicCondition}
                        onChange={(e) => setTempMedical({ ...tempMedical, hasChronicCondition: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      >
                        <option value="No">No chronic conditions</option>
                        <option value="Yes">Yes (Needs special declaration)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company Mediclaim Opt-in</label>
                      <select
                        value={tempMedical.mediclaimCovered}
                        onChange={(e) => setTempMedical({ ...tempMedical, mediclaimCovered: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      >
                        <option value="Yes">Yes (Standard coverage)</option>
                        <option value="No">No (Waive benefit option)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Health Policy & Coverage Details</label>
                    <input
                      type="text"
                      value={tempMedical.healthPolicyDetail}
                      onChange={(e) => setTempMedical({ ...tempMedical, healthPolicyDetail: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'emergency' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl mb-2">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase mb-0.5">Safety Requirement</span>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
                      Provide two valid contact numbers. HR will use these only during workplace emergencies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Primary Contact</label>
                      <input
                        type="text"
                        value={tempEmergency.primaryName}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryName: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={tempEmergency.primaryRelation}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryRelation: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={tempEmergency.primaryPhone}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryPhone: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Secondary Contact</label>
                      <input
                        type="text"
                        value={tempEmergency.secondaryName}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryName: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={tempEmergency.secondaryRelation}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryRelation: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={tempEmergency.secondaryPhone}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryPhone: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Primary Residence Address</label>
                    <textarea
                      value={tempEmergency.physicalAddress}
                      onChange={(e) => setTempEmergency({ ...tempEmergency, physicalAddress: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200 resize-none"
                      required
                    />
                  </div>
                </div>
              )}

              {editingSection === 'skills' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Primary Technical Stack</label>
                      <input
                        type="text"
                        value={tempSkills.primaryStack}
                        onChange={(e) => setTempSkills({ ...tempSkills, primaryStack: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Certifications Index</label>
                      <input
                        type="text"
                        value={tempSkills.certifications}
                        onChange={(e) => setTempSkills({ ...tempSkills, certifications: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Key Expert Skills & Frameworks</label>
                    <input
                      type="text"
                      value={tempSkills.keySkills}
                      onChange={(e) => setTempSkills({ ...tempSkills, keySkills: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Systems Capability Statement</label>
                    <textarea
                      value={tempSkills.capabilityStatement}
                      onChange={(e) => setTempSkills({ ...tempSkills, capabilityStatement: e.target.value })}
                      className="w-full h-24 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none text-slate-800 dark:text-zinc-200 resize-none"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-end gap-3 text-right">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditModal}
                className="px-5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-indigo-300" /> Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
