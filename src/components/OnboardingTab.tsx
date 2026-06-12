import React, { useState } from 'react';
import { 
  FileText, Download, Upload, CheckCircle2, AlertCircle, ArrowRight, 
  Sparkles, ShieldAlert, Check, Milestone, HelpCircle, FileCheck,
  Users, Heart, Phone, Award, Edit3, X, Save
} from 'lucide-react';
import { motion } from 'motion/react';

export function OnboardingTab() {
  // Checkboxes for tracking progress
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    'family_details': true,
    'medical_condition': false,
    'emergency_contacts': true,
    'edu_qualification': false,
    'skills_sets': false,
    'employment_details': false,
    'joining_report': false,
    'pf_form': false,
    'nda_form': false,
    'gratuity_form': false,
    'mediclaim_form': false,
    'bcg_form': false,
    'esic_form2': false,
  });

  // Editable structures for joining formalities
  const [familyDetails, setFamilyDetails] = useState({
    spouseName: 'Simran Gupta',
    fatherName: 'Alok Gupta',
    motherName: 'Sushma Gupta',
    dependentsCount: '2',
    dependentsList: 'Sia Gupta (Daughter), Aarav Gupta (Son)',
  });

  const [medicalConditions, setMedicalConditions] = useState({
    bloodGroup: 'B+',
    allergies: 'None reported',
    hasChronicCondition: 'No',
    mediclaimCovered: 'Yes',
    healthPolicyDetail: 'Plan Premium Option A (Family floater covers up to 5 Lakhs)',
  });

  const [emergencyContacts, setEmergencyContacts] = useState({
    primaryName: 'Sanjay Gupta',
    primaryRelation: 'Brother',
    primaryPhone: '+91 98765 43210',
    secondaryName: 'Neha Gupta',
    secondaryRelation: 'Spouse',
    secondaryPhone: '+91 98123 45678',
    physicalAddress: 'Apartment 202, Sector 62, Noida, Uttar Pradesh - 201301',
  });

  const [skillsSets, setSkillsSets] = useState({
    primaryStack: 'Fullstack Engineering (React + Node.js)',
    keySkills: 'React, TypeScript, Tailwind CSS, PostgreSQL, AWS, Docker',
    certifications: 'AWS Certified Solutions Architect',
    capabilityStatement: '7+ years of industrial experience in cloud architecture and enterprise frontend systems.',
  });

  // Track the section being edited in a modal
  const [editingSection, setEditingSection] = useState<'family' | 'medical' | 'emergency' | 'skills' | null>(null);

  // Temporary state of form during editing
  const [tempFamily, setTempFamily] = useState({ ...familyDetails });
  const [tempMedical, setTempMedical] = useState({ ...medicalConditions });
  const [tempEmergency, setTempEmergency] = useState({ ...emergencyContacts });
  const [tempSkills, setTempSkills] = useState({ ...skillsSets });

  const openEditModal = (section: 'family' | 'medical' | 'emergency' | 'skills') => {
    if (formSubmitted) return;
    if (section === 'family') {
      setTempFamily({ ...familyDetails });
    } else if (section === 'medical') {
      setTempMedical({ ...medicalConditions });
    } else if (section === 'emergency') {
      setTempEmergency({ ...emergencyContacts });
    } else if (section === 'skills') {
      setTempSkills({ ...skillsSets });
    }
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
  };

  // Track file uploads
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // File categories for upload simulation
  const fileCategories = [
    { id: 'edu_cert', label: 'Educational Qualification Scan' },
    { id: 'relieving_letter', label: 'Relieving & Experience Letter' },
    { id: 'salary_slips', label: 'Last 3 Months Salary Slips' },
    { id: 'nda_signed', label: 'Signed ParkEngage NDA Form' },
  ];

  const toggleCheck = (id: string) => {
    if (formSubmitted) return;
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (catId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (formSubmitted) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [catId]: file.name
      }));
    }
  };

  const totalTasks = Object.keys(checkedItems).length + fileCategories.length;
  const completedTasks = Object.values(checkedItems).filter(Boolean).length + Object.keys(uploadedFiles).length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const handleSubmit = () => {
    setFormSubmitted(true);
  };

  // Mock downloads
  const handleDownloadFile = (fileName: string) => {
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', fileName);
    // Mimic actual file generation
    alert(`Initiating secure download for: ${fileName}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Upper Status Row with Premium Animated/Glowing Gradient Header & Dynamic Bottom Stripe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 p-8 md:p-10 rounded-3xl text-white shadow-xl border border-zinc-800 relative overflow-hidden">
        {/* Visual glass effect ambient orbs */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Dynamic bottom glow gradient border as requested to make it different */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-brand animate-pulse"></div>
        
        <div className="space-y-3.5 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest uppercase text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            Compliance Node Active
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white leading-tight">
            Joining Formality Compliance
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
            Please complete all checklist items, download the mandatory HR structures from the right-hand panel, scan/upload the signed outputs, and trigger preview.
          </p>
        </div>

        {/* Progress Tracker Widget - Glassmorphic details */}
        <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-5 border border-zinc-800 text-right shrink-0 md:w-80 relative z-10 w-full transition-transform">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Total Progress</span>
            <span className="text-xs font-bold text-indigo-405 font-mono bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-805">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-3 border border-zinc-805">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-305 font-medium text-left flex justify-between items-center bg-zinc-900/60 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-indigo-400 font-mono">{progressPercentage}% completed</span>
            {formSubmitted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Checked & Locked
              </span>
            ) : (
              <span className="text-zinc-400 font-mono">Pending Lock</span>
            )}
          </p>
        </div>
      </div>

      {/* Grid of contents: Left is core requirements, Right are download files */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Pane - Instructions, compliance, checklist */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Joining Formality Directions</h3>
                <p className="text-xs text-slate-400">Step-by-step verification instructions and document uploads.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleDownloadFile('Sample_Onboarding_Form_Pack.pdf')}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-750 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Sample Forms
                </button>
                <button 
                  onClick={() => handleDownloadFile('Joining_Formality_Guideline_v2.pptx')}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-755 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Joining Formality Guideline PPT
                </button>
              </div>
            </div>

            {/* Page 1 Requirements */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50/80 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-sm font-display shadow-sm">1</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Page 1 Requirements</h4>
                  <p className="text-[10px] text-slate-400">Verify details are aligned with legal credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                {/* Family Details Interactive Block */}
                <div 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['family_details'] 
                      ? 'bg-brand/5 border-brand/20 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('family_details');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['family_details'] ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-slate-50 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['family_details'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Family Details
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('family')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Spouse name, dependencies, parents' records and emergency phone-lines.</p>
                      
                      {/* Compact Metadata View */}
                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Spouse:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.spouseName || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Father:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.fatherName || 'Not declared'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100/60 dark:border-zinc-850 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Mother:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.motherName || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Dependents:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{familyDetails.dependentsCount} ({familyDetails.dependentsList})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Conditions Interactive Block */}
                <div 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['medical_condition'] 
                      ? 'bg-brand/5 border-brand/20 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('medical_condition');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['medical_condition'] ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-slate-50 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['medical_condition'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          <Heart className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Medical Conditions
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('medical')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Blood group, critical allergies, health policy option, and declaration statement.</p>
                      
                      {/* Compact Metadata View */}
                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Blood Group:</span>
                            <span className="font-bold text-red-500 font-mono truncate block">{medicalConditions.bloodGroup || 'Not declared'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Allergies:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.allergies || 'None'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100/60 dark:border-zinc-850 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Chronic History:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.hasChronicCondition}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Mediclaim Plan:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{medicalConditions.mediclaimCovered} ({medicalConditions.healthPolicyDetail})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts Interactive Block */}
                <div 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['emergency_contacts'] 
                      ? 'bg-brand/5 border-brand/20 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('emergency_contacts');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['emergency_contacts'] ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-slate-50 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['emergency_contacts'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Emergency Contacts
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('emergency')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Dual secondary physical address contacts with verification credentials.</p>
                      
                      {/* Compact Metadata View */}
                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Primary Contact:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{emergencyContacts.primaryName} ({emergencyContacts.primaryRelation})</span>
                            <span className="font-mono text-[9px] text-indigo-600 font-bold block">{emergencyContacts.primaryPhone}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Secondary Contact:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{emergencyContacts.secondaryName} ({emergencyContacts.secondaryRelation})</span>
                            <span className="font-mono text-[9px] text-indigo-600 font-bold block">{emergencyContacts.secondaryPhone}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100/60 dark:border-zinc-850 pt-1.5 truncate">
                          <span className="text-slate-400 block font-medium">Primary Address / Residence:</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200 block truncate" title={emergencyContacts.physicalAddress}>{emergencyContacts.physicalAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Qualifications - unchanged functional requirements but responsive */}
                <div 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    uploadedFiles['edu_cert'] 
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 border border-slate-100 shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Educational Qualifications</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Requires self-attested scan of absolute degree/certificated diploma.</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {uploadedFiles['edu_cert'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['edu_cert']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-semibold">• Scan Missing</span>
                    )}
                    
                    <label className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> PDF/JPG
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
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50/80 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-sm font-display shadow-sm">2</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Page 2 Requirements</h4>
                  <p className="text-[10px] text-slate-400">Previous employer credentials, sign forms, and client admin submissions.</p>
                </div>
              </div>

              {/* Requirement Checkboxes Continued */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                <div 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    checkedItems['skills_sets'] 
                      ? 'bg-brand/5 border-brand/20 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 h-full">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck('skills_sets');
                      }}
                      className={`mt-1 w-4.5 h-4.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        checkedItems['skills_sets'] ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-slate-50 hover:border-brand'
                      }`}
                      title="Mark as Verified"
                    >
                      {checkedItems['skills_sets'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Skills Sets Declaration
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal('skills')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-indigo-600" /> Edit
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-normal">Core technical programming stacks, systems capability statement and cert index.</p>
                      
                      {/* Compact Metadata View */}
                      <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 space-y-1.5 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-2">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Core Stack:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.primaryStack}>{skillsSets.primaryStack}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Certifications:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.certifications}>{skillsSets.certifications || 'None'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 border-t border-slate-100/60 dark:border-zinc-850 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Expert Skills:</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block" title={skillsSets.keySkills}>{skillsSets.keySkills}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-400 block font-medium">Statement:</span>
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
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 border border-slate-100 shrink-0">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Employment Details</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">(N/A for freshers) Relieving / Experience / Resignation acceptance letters.</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {uploadedFiles['relieving_letter'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['relieving_letter']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-semibold">• Upload optional</span>
                    )}
                    
                    <label className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all">
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
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 border border-slate-100 shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Salary Slips Slates</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Scans of latest salary slips of last 3 months of previous company.</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {uploadedFiles['salary_slips'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['salary_slips']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">• Optional uploads</span>
                    )}
                    
                    <label className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all">
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
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 border border-slate-100 shrink-0">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Signed Forms scan pack</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">All downloaded forms from right table (NDA, PF, Gratuity) filled & signed.</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {uploadedFiles['nda_signed'] ? (
                      <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {uploadedFiles['nda_signed']}
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-semibold">• Mandatory scan</span>
                    )}
                    
                    <label className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all">
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
              </div>

              {/* General Guidelines Bullet Nodes - exact transcript from image */}
              <div className="bg-slate-50 rounded-2xl p-5 mt-4 space-y-3.5 border border-slate-100">
                <span className="text-[9px] font-bold tracking-wider text-slate-500 block uppercase">Important Compliance Guidelines</span>
                <ul className="space-y-3.5 text-xs text-slate-600 leading-normal list-none">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0"></div>
                    <div>
                      Download, fill, scan and upload following forms. All relevant documents are provided on the right hand side for download. • Joining report • PF Form 11 • Parkengage NDA Form (Signatures are required on all pages) • Gratuity Form F • Mediclaim Form • Employment form(BCG) • ESIC Form • PF Form 2.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0"></div>
                    <div>
                      <strong>Preview:</strong> Click options to check your scanned and filled parameters at a glance and rectify any onboarding errors.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0"></div>
                    <div>
                      After filling all details and verifying checked structures, there will be an option to <strong>Submit</strong> the form. Once you click on Submit, your records will be submitted and the same will become non-editable.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0"></div>
                    <div>
                      Employee needs to submit physical hand-signed hardcopies of all the above forms to the respective <strong>Client Admin</strong> on the physical joining day.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Action Section with the Next/Preview Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-brand" />
                <span className="text-xs text-slate-400 font-medium">Verify your entries before locking. Once locked, admin intervention is required.</span>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all font-bold text-xs rounded-xl cursor-pointer"
                >
                  Preview Compliance Form
                </button>
                <button
                  type="button"
                  disabled={formSubmitted}
                  onClick={handleSubmit}
                  className={`w-full sm:w-auto px-7 py-2.5 font-bold font-display text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    formSubmitted 
                      ? 'bg-emerald-550 text-white cursor-not-allowed shadow-none' 
                      : 'bg-brand hover:bg-brand-hover text-white shadow-brand/10'
                  }`}
                >
                  {formSubmitted ? (
                    <>
                      <Check className="w-4.5 h-4.5" /> Locked & Submitted
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

        {/* Right Pane - Form download structures matching original design specification */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 1: Downloads list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-800 font-display pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
              <span>Mandatory HR Forms</span>
              <span className="text-[9px] bg-brand-light text-brand px-2 py-0.5 rounded-full font-mono font-bold tracking-tight">8 Files</span>
            </h3>

            <div className="space-y-2">
              {[
                { label: 'Joining Report Form', file: 'Joining_Report_v4.pdf' },
                { label: 'PF Form 11 (Declaration)', file: 'PF_Form_11_v2.pdf' },
                { label: 'ParkEngage NDA Form (Sign All Pages)', file: 'Parkengages_NDA_v2.pdf' },
                { label: 'Gratuity Form F', file: 'Gratuity_Form_F.pdf' },
                { label: 'Mandatory Mediclaim Form', file: 'Mediclaim_Onboarding.pdf' },
                { label: 'PF Form 2 (Nomination)', file: 'PF_Form_2.pdf' },
                { label: 'PF Filing Guideline Doc', file: 'PF_Filing_Guidelines.pdf' },
                { label: 'Gratuity Directives Guideline', file: 'Gratuity_Guidelines.pdf' },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleDownloadFile(item.file)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-brand flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-all">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-750 block truncate max-w-[150px] md:max-w-xs">{item.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono block">{item.file}</span>
                    </div>
                  </div>
                  <button className="p-1 px-2.5 rounded-lg bg-slate-50 group-hover:bg-brand group-hover:text-white text-slate-500 border border-slate-150 transition-all text-[11px] font-bold flex items-center gap-0.5">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Policy Documents list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-800 font-display pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
              <span>Policy & Directives</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold tracking-tight">System</span>
            </h3>

            <div className="space-y-2">
              {[
                { label: 'POSH Compliance Policy', file: 'POSH_Compliance_v1.pdf' },
                { label: 'Anti Bribery & Corruption directives', file: 'Anti_Corruption_Policy.pdf' },
                { label: 'Human Rights & Labour Code Book', file: 'Human_Rights_Policy_2026.pdf' },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleDownloadFile(item.file)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FileCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-750 block truncate max-w-[150px] md:max-w-xs">{item.label}</span>
                      <span className="text-[9px] text-zinc-400 tracking-wide font-mono block uppercase">{item.file}</span>
                    </div>
                  </div>
                  <button className="p-1 px-2.5 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 border border-slate-150 transition-all text-[11px] font-bold flex items-center gap-0.5">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Preview Modal for absolute compliance review */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setPreviewOpen(false)}></div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden relative z-10">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-brand block uppercase">Form Compliance Preview</span>
                <h4 className="text-lg font-bold font-display">Onboarding Form Slate Check</h4>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close Preview
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3.5 text-xs text-slate-700">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">Metadata details</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-450 block uppercase">Status Code:</span>
                    <span className="font-bold text-cyan-600 font-mono">ONBOARD_V4_PENDING</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-450 block uppercase">Total checked metrics:</span>
                    <span className="font-bold font-mono">{completedTasks} selected items</span>
                  </div>
                </div>
              </div>

              {/* Requirement categories status checklist */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase">Status of mandatory checklists:</span>
                
                {[
                  { label: 'Family details index block', active: checkedItems['family_details'] },
                  { label: 'Medical histories & Group declarations', active: checkedItems['medical_condition'] },
                  { label: 'Emergency secondary phone channels', active: checkedItems['emergency_contacts'] },
                  { label: 'Education Diploma Degree scans verified', active: !!uploadedFiles['edu_cert'] },
                  { label: 'Technical declaration and Skill sets indexed', active: checkedItems['skills_sets'] },
                  { label: 'Signed forms scan matching HR records', active: !!uploadedFiles['nda_signed'] },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-750">{item.label}</span>
                    {item.active ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                        <AlertCircle className="w-3 h-3" /> MISSING
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-700 leading-normal">
                  <strong>Verification Statement:</strong> By executing lock submission, you formally certify that all digital assets represent true and correct identity indicators. Discrepancies will prompt a verification fault and mandate human HR audit.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 text-right">
              <button 
                onClick={() => setPreviewOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white font-bold font-display text-xs rounded-xl cursor-pointer"
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingSection(null)}></div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl w-full max-w-xl overflow-hidden relative z-10 transition-all duration-200">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-indigo-300 block uppercase">Modify Compliance Records</span>
                <h4 className="text-lg font-bold font-display">
                  {editingSection === 'family' && 'Update Family Information'}
                  {editingSection === 'medical' && 'Configure Medical & Health Options'}
                  {editingSection === 'emergency' && 'Update Emergency Contacts'}
                  {editingSection === 'skills' && 'Declare Core Skill & Competencies'}
                </h4>
              </div>
              <button 
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
                      placeholder="e.g. Daughter (Sia), Son (Aarav)"
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
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Critical Allergies / Food restrictions</label>
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Has Chronic Condition history?</label>
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Opt in Company Mediclaim Scheme?</label>
                      <select 
                        value={tempMedical.mediclaimCovered}
                        onChange={(e) => setTempMedical({ ...tempMedical, mediclaimCovered: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      >
                        <option value="Yes">Yes (Standard premium options)</option>
                        <option value="No">No (Waive benefit option)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Specific Health Policy and Coverage Details</label>
                    <input 
                      type="text" 
                      value={tempMedical.healthPolicyDetail}
                      onChange={(e) => setTempMedical({ ...tempMedical, healthPolicyDetail: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      placeholder="e.g. Premium Option A (floater cover)"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'emergency' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-955/20 border border-amber-200/40 rounded-xl mb-2">
                    <span className="text-[10px] text-amber-600 font-bold block uppercase mb-0.5">Physical Safety Mandate</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Provide two valid contact channels. These individuals will be contacted by HR first in case of critical site closures or natural alerts.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Primary contact</label>
                      <input 
                        type="text" 
                        value={tempEmergency.primaryName}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryName: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Contact name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Relationship</label>
                      <input 
                        type="text" 
                        value={tempEmergency.primaryRelation}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryRelation: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Relation"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Phone Line</label>
                      <input 
                        type="text" 
                        value={tempEmergency.primaryPhone}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, primaryPhone: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Secondary contact</label>
                      <input 
                        type="text" 
                        value={tempEmergency.secondaryName}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryName: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Relationship</label>
                      <input 
                        type="text" 
                        value={tempEmergency.secondaryRelation}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryRelation: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Relation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Phone Line</label>
                      <input 
                        type="text" 
                        value={tempEmergency.secondaryPhone}
                        onChange={(e) => setTempEmergency({ ...tempEmergency, secondaryPhone: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Primary Physical Residence Address (Full)</label>
                    <textarea 
                      value={tempEmergency.physicalAddress}
                      onChange={(e) => setTempEmergency({ ...tempEmergency, physicalAddress: e.target.value })}
                      className="w-full h-20 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200 resize-none"
                      placeholder="e.g. Street, Sector, City, State & Pincode"
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
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="e.g. Fullstack Developer / Frontend Lead"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Certifications Index</label>
                      <input 
                        type="text" 
                        value={tempSkills.certifications}
                        onChange={(e) => setTempSkills({ ...tempSkills, certifications: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                        placeholder="e.g. AWS Solutions Architect, Scrum Master"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Key Expert Skills & Frameworks (Comma separated)</label>
                    <input 
                      type="text" 
                      value={tempSkills.keySkills}
                      onChange={(e) => setTempSkills({ ...tempSkills, keySkills: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200"
                      placeholder="e.g. React, Node.js, Python, PostgreSQL, AWS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Systems Capability Statement</label>
                    <textarea 
                      value={tempSkills.capabilityStatement}
                      onChange={(e) => setTempSkills({ ...tempSkills, capabilityStatement: e.target.value })}
                      className="w-full h-24 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand outline-none transition-all text-slate-800 dark:text-zinc-200 resize-none"
                      placeholder="Brief summary of your professional capability and engineering experience..."
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
                Cancel Changes
              </button>
              <button 
                type="button"
                onClick={saveEditModal}
                className="px-5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-indigo-400" /> Save Compliance Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
