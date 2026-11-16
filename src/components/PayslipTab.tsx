import React, { useState } from 'react';
import { Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Payslip, EmployeeProfile } from '../types';

interface PayslipTabProps {
  payslips: Payslip[];
  profile: EmployeeProfile;
}

export function PayslipTab({ payslips, profile }: PayslipTabProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips[0] || null);
  const [exportComplete, setExportComplete] = useState(false);

  const formattedCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStatement = () => {
    if (!selectedPayslip) return;
    const htmlContent = `<!doctype html>
<html><head><meta charset="utf-8"><title>Payslip ${selectedPayslip.month} ${selectedPayslip.year}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;color:#0f172a;line-height:1.5}
h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}
td,th{border:1px solid #cbd5e1;padding:8px 12px;text-align:left;font-size:13px}
th{background:#f8fafc}</style></head>
<body>
<h1>ParkEngage Solutions — Salary Statement (${selectedPayslip.month} ${selectedPayslip.year})</h1>
<p>Employee: <strong>${profile.firstName} ${profile.lastName}</strong> (${profile.employeeId}) &bull; ${profile.designation}</p>
<table>
<tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr>
<tr><td>Basic Salary</td><td>${formattedCurrency(selectedPayslip.basicSalary)}</td><td>Provident Fund (EPF)</td><td>${formattedCurrency(selectedPayslip.pfDeduction)}</td></tr>
<tr><td>HRA</td><td>${formattedCurrency(selectedPayslip.hra)}</td><td>TDS / Withholding</td><td>${formattedCurrency(selectedPayslip.tdsDeduction)}</td></tr>
<tr><td>Conveyance</td><td>${formattedCurrency(selectedPayslip.conveyanceAllowance)}</td><td>Professional Tax</td><td>${formattedCurrency(selectedPayslip.professionalTax)}</td></tr>
<tr><td>Special Allowance</td><td>${formattedCurrency(selectedPayslip.specialAllowance)}</td><td><strong>Total Deductions</strong></td><td><strong>${formattedCurrency(selectedPayslip.totalDeductions)}</strong></td></tr>
</table>
<p><strong>Gross Earnings:</strong> ${formattedCurrency(selectedPayslip.grossEarnings)} &nbsp;|&nbsp; <strong>Net Payable:</strong> ${formattedCurrency(selectedPayslip.netPayable)}</p>
<p style="font-size:11px;color:#64748b">Paid Date: ${selectedPayslip.salaryPaidDate} &bull; PAN: ${profile.panNumber} &bull; UAN: ${profile.uanNumber}</p>
</body></html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${selectedPayslip.month}_${selectedPayslip.year}_${profile.employeeId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 3500);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Payslips &amp; Earnings</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">View monthly salary breakdowns, statutory deductions, and download verified statements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-semibold text-xs uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Payroll Runs</h3>
          {payslips.map(ps => {
            const isSelected = selectedPayslip?.id === ps.id;
            return (
              <button
                key={ps.id}
                type="button"
                onClick={() => setSelectedPayslip(ps)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-indigo-600 border-slate-950 dark:border-indigo-500 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    Payroll Cycle
                  </span>
                  <h4 className="font-bold text-sm leading-tight mt-0.5">{ps.month} {ps.year}</h4>
                  <p className={`text-[10px] mt-1 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400 dark:text-zinc-500'}`}>
                    Paid: {ps.salaryPaidDate}
                  </p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <div className="font-mono font-bold text-sm tracking-tight">{formattedCurrency(ps.netPayable)}</div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    Credited
                  </span>
                </div>
              </button>
            );
          })}

          <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">Direct Deposit Account</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
              Salary is transferred directly via NEFT/IMPS to <strong className="text-slate-800 dark:text-zinc-200">{profile.bankName}</strong>.
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 space-y-0.5">
              <p>ACCOUNT: {profile.bankAccountNo}</p>
              <p>IFSC: {profile.ifscCode}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          {selectedPayslip ? (
            <>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Payroll Statement</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    type="button"
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>

                  <button
                    onClick={handleDownloadStatement}
                    type="button"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Statement
                  </button>
                </div>
              </div>

              {exportComplete && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Saved statement as <strong>Payslip_{selectedPayslip.month}_{selectedPayslip.year}_{profile.employeeId}.html</strong>
                  </span>
                </div>
              )}

              <div
                id="printable-payslip-canvas"
                className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 bg-slate-50/40 dark:bg-zinc-950/40 space-y-6 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-bold text-xs font-display">
                        P
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide font-display">
                        ParkEngage Solutions
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">H-195, Sector 63, Noida, Uttar Pradesh 201301</p>
                  </div>
                  <div className="sm:text-right">
                    <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white tracking-tight">Salary Statement</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                      {selectedPayslip.month.toUpperCase()} {selectedPayslip.year}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">Employee ID</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">{profile.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">Name</span>
                    <span className="text-slate-900 dark:text-white font-bold">{profile.firstName} {profile.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">Department</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{profile.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">Designation</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{profile.designation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">UAN</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-200">{profile.uanNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">PF Account</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-200 truncate block">{profile.pfAccountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">PAN</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-200">{profile.panNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 block font-bold">Payment Date</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-200">{selectedPayslip.salaryPaidDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 tabular-nums">
                  <div className="space-y-2">
                    <div className="bg-slate-100 dark:bg-zinc-900 p-2.5 rounded-xl font-bold text-[10px] text-slate-700 dark:text-zinc-300 uppercase tracking-wide flex items-center justify-between border border-slate-200/80 dark:border-zinc-800">
                      <span>Earnings</span>
                      <span>Amount</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>Basic Salary</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.basicSalary)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>House Rent Allowance (HRA)</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.hra)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>Conveyance Allowance</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.conveyanceAllowance)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>Special Allowance</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.specialAllowance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-slate-100 dark:bg-zinc-900 p-2.5 rounded-xl font-bold text-[10px] text-slate-700 dark:text-zinc-300 uppercase tracking-wide flex items-center justify-between border border-slate-200/80 dark:border-zinc-800">
                      <span>Deductions</span>
                      <span>Amount</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>Provident Fund (EPF)</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.pfDeduction)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>TDS / Tax Withheld</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.tdsDeduction)}</span>
                      </div>
                      <div className="flex items-center justify-between px-2 text-slate-600 dark:text-zinc-400">
                        <span>Professional Tax</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{formattedCurrency(selectedPayslip.professionalTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs tabular-nums">
                  <div className="flex items-center justify-between px-2 font-bold text-slate-800 dark:text-zinc-200">
                    <span>Gross Earnings</span>
                    <span className="font-mono">{formattedCurrency(selectedPayslip.grossEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 font-bold text-slate-800 dark:text-zinc-200">
                    <span>Total Deductions</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">{formattedCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 dark:bg-zinc-950 text-white rounded-2xl flex items-center justify-between flex-wrap gap-4 border border-slate-800 tabular-nums">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Net Payable</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Credited to {profile.bankName} ({profile.bankAccountNo})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">{formattedCurrency(selectedPayslip.netPayable)}</span>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Disbursed</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 flex flex-col sm:flex-row justify-between gap-2">
                  <span>System-generated salary statement. No physical signature required.</span>
                  <span className="font-mono">REF: PE-{selectedPayslip.id.toUpperCase()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8 text-slate-400 dark:text-zinc-500 text-sm">
              Select a payslip from the left panel to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
