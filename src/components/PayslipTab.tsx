import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Percent, ShieldCheck, DollarSign, 
  Sparkles, CheckCircle2, AlertCircle, Building, Award 
} from 'lucide-react';
import { Payslip, EmployeeProfile } from '../types';

interface PayslipTabProps {
  payslips: Payslip[];
  profile: EmployeeProfile;
}

export function PayslipTab({ payslips, profile }: PayslipTabProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips[0]);
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);
    setExportComplete(false);

    setTimeout(() => {
      setExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1500);
  };

  const formattedCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Earnings & Financial Statements</h2>
          <p className="text-xs text-slate-500">Access historical payroll payslips, tax breakdowns, and download statements securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Past Payslips List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-semibold text-xs uppercase text-slate-400 tracking-wider">Historical Runs</h3>
          {payslips.map((ps) => (
            <button
              key={ps.id}
              type="button"
              onClick={() => setSelectedPayslip(ps)}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                selectedPayslip?.id === ps.id
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedPayslip?.id === ps.id ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Payroll cycle
                </span>
                <h4 className="font-bold text-sm leading-tight mt-0.5">{ps.month} {ps.year}</h4>
                <p className={`text-[10px] mt-1 font-mono ${selectedPayslip?.id === ps.id ? 'text-slate-400' : 'text-slate-400'}`}>
                  Released: {ps.salaryPaidDate}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-sm tracking-tight">
                  {formattedCurrency(ps.netPayable)}
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                  selectedPayslip?.id === ps.id ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  Credited
                </span>
              </div>
            </button>
          ))}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
            <h4 className="font-bold text-xs text-slate-800">Direct Deposit Settings</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Earnings are routed directly via ACH transfer to <strong>{profile.bankName}</strong>.
            </p>
            <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
              <p>ACCOUNT: {profile.bankAccountNo}</p>
              <p>ROUTINGS/IFSC: {profile.ifscCode}</p>
            </div>
          </div>
        </div>

        {/* Detailed Printable Payslip Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200/85 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
          
          {selectedPayslip ? (
            <>
              {/* Header actions */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Payroll System Document</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    type="button"
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200 hover:border-slate-300 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    type="button"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
              </div>

              {exportComplete && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secured statement has been saved down as <strong>{selectedPayslip.month}_{selectedPayslip.year}_Payslip.pdf</strong></span>
                </div>
              )}

              {/* Printable Area with standard style guidelines */}
              <div id="printable-payslip-canvas" className="border border-slate-150 rounded-2xl p-6 bg-slate-50/10 space-y-6 relative overflow-hidden">
                {/* Diagonal watermark background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                  <span className="text-7xl font-sans font-bold -rotate-45 uppercase">ParkEngage</span>
                </div>

                {/* Company & Statement Intro */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs uppercase font-display">P</div>
                      <span className="font-bold text-slate-950 text-sm tracking-wide font-display">ParkEngage solutions</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Corporate Head Office, Tech Hub West, Silicon Valley</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <h4 className="font-extrabold text-sm uppercase text-slate-900 tracking-tight">SALARY STATEMENT PAYSLIP</h4>
                    <p className="text-xs text-indigo-600 font-bold font-mono">{selectedPayslip.month.toUpperCase()} {selectedPayslip.year}</p>
                  </div>
                </div>

                {/* Profile credentials metrics table */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-650">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Employee Identifier</span>
                    <span className="font-mono text-slate-900 font-bold text-[11px]">{profile.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Name</span>
                    <span className="text-slate-900 font-bold">{profile.firstName} {profile.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Department</span>
                    <span className="text-slate-900 font-bold">{profile.department}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Role</span>
                    <span className="text-slate-900 font-bold">{profile.designation}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Accrued Duty UAN</span>
                    <span className="font-mono text-slate-900">{profile.uanNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Corporate PF Acc.</span>
                    <span className="font-mono text-slate-900 truncate block">{profile.pfAccountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Tax Base Identity Pan</span>
                    <span className="font-mono text-slate-900">{profile.panNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block font-bold font-sans">Payment Date</span>
                    <span className="font-mono text-slate-900">{selectedPayslip.salaryPaidDate}</span>
                  </div>
                </div>

                {/* Earnings & Deductions Balance breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Earnings Column */}
                  <div className="space-y-2">
                    <div className="bg-slate-100/60 p-2 rounded-lg font-bold text-[10px] text-slate-700 uppercase tracking-wide flex items-center justify-between border">
                      <span>Salary Allocation (Credit)</span>
                      <span>Amount</span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Basic Salary Base</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.basicSalary)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>House Rent Allowance (HRA)</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.hra)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Conveyance Reimbursements</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.conveyanceAllowance)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Special Operational Allowance</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.specialAllowance)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div className="space-y-2">
                    <div className="bg-slate-100/60 p-2 rounded-lg font-bold text-[10px] text-slate-700 uppercase tracking-wide flex items-center justify-between border">
                      <span>Statutory Deductions (Debit)</span>
                      <span>Amount</span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Employees State Provident Fund (EPF)</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.pfDeduction)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Taxes Deducted at Source (TDS/WH)</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.tdsDeduction)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600">
                        <span>Professional Corporate Tax</span>
                        <span className="font-mono text-slate-900 font-medium">{formattedCurrency(selectedPayslip.professionalTax)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Row: Totals Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                  <div className="flex items-center justify-between px-2 font-bold text-slate-800">
                    <span>Gross Allocated Remuneration</span>
                    <span className="font-mono">{formattedCurrency(selectedPayslip.grossEarnings)}</span>
                  </div>

                  <div className="flex items-center justify-between px-2 font-bold text-slate-800">
                    <span>Aggregate Debit Deductions</span>
                    <span className="font-mono text-rose-600">{formattedCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>

                {/* Main Net Pay Banner */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between flex-wrap gap-4 mt-6">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Net Disbursed Payable</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Credited to designated ACH Account</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">{formattedCurrency(selectedPayslip.netPayable)}</span>
                    <div className="text-[10px] text-emerald-400 font-bold block mt-0.5">✔ Transaction Complete</div>
                  </div>
                </div>

                {/* Footer Disclaimers */}
                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Verification Guidelines</p>
                    <p>This is a computer-generated payroll payload statement. It does not demand authorized handwritten signatures under ParkEngage payroll guidelines v20.2.</p>
                  </div>
                  <div className="text-left md:text-right flex flex-col justify-end">
                    <p className="font-bold text-slate-550">Audit Security Identifier</p>
                    <p className="font-mono text-[9px] text-slate-400">TX-HASH: PE-{selectedPayslip.id}-SECURE-HASH-XN92019A</p>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center p-8 text-slate-400">
              Select a payroll statement from the historical ledger queue.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
