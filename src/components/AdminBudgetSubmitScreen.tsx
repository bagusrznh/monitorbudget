/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Send, 
  AlertTriangle,
  History,
  FileText,
  UserCheck,
  Calculator,
  Inbox,
  Mail,
  ShieldAlert,
  Save,
  Grid
} from 'lucide-react';
import { BudgetRequest, VehicleDetail, BranchCcConfig, UserAccount } from '../types';

interface AdminBudgetSubmitScreenProps {
  requests: BudgetRequest[];
  onSave: (request: BudgetRequest) => void;
  branchCcConfigs: BranchCcConfig[];
  currentUser: UserAccount | null;
}

export default function AdminBudgetSubmitScreen({
  requests,
  onSave,
  branchCcConfigs,
  currentUser
}: AdminBudgetSubmitScreenProps) {
  // Filter requests that are editable/pending processing for beautiful quick access 
  // (Or include all so they can re-approve or refine anytime!)
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [activeRequest, setActiveRequest] = useState<BudgetRequest | null>(null);

  // Form states specifically tailored per role
  const [statusVal, setStatusVal] = useState<'Request' | 'SUBMIT' | 'PENDING'>('Request');
  const [aftersalesInput, setAftersalesInput] = useState<string>('');
  
  // Local fleet values for budget staff editing
  const [editableVehicles, setEditableVehicles] = useState<VehicleDetail[]>([]);

  // Email simulation triggers
  const [notification, setNotification] = useState<string | null>(null);
  const [showEmailReport, setShowEmailReport] = useState<boolean>(false);
  const [emailDetails, setEmailDetails] = useState<{
    to: string;
    cc: string[];
    replyCc?: string;
    subject: string;
    body: string;
  } | null>(null);

  // Auto-select first request or when selected ID matches
  useEffect(() => {
    if (requests.length > 0) {
      const match = requests.find(r => r.id === selectedRequestId) || requests[0];
      setSelectedRequestId(match.id);
      setActiveRequest(match);
      setStatusVal(match.status);
      setAftersalesInput(match.formInputAftersales || '');
      setEditableVehicles(match.vehicles || []);
    }
  }, [selectedRequestId, requests]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3050);
  };

  const handleUpdateVehicleBudget = (vId: string, valStr: string) => {
    const value = valStr === '' ? null : parseFloat(valStr);
    setEditableVehicles(prev => prev.map(v => v.id === vId ? { ...v, budgetMaintenance: value } : v));
  };

  // Find active CC guidelines for the targeted branch area
  const cabangName = activeRequest?.cabang || 'Jakarta';
  const activeBranchConfig = branchCcConfigs.find(
    cfg => cfg.cabang.toLowerCase() === cabangName.toLowerCase()
  ) || {
    cabang: cabangName,
    emailBos: `bos.${cabangName.toLowerCase()}@tunasrent.com`,
    emailTeamAdminCC: `admin.${cabangName.toLowerCase()}@tunasrent.com`
  };

  const calculateTotalBudget = () => {
    return editableVehicles.reduce((acc, curr) => {
      const budget = curr.budgetMaintenance || 0;
      const qty = curr.qty || 1;
      return acc + (budget * qty);
    }, 0);
  };

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    // Build payload with updated parameters depending on user roles
    const isBudgetStaff = currentUser?.role === 'Budget Staff';

    const updatedRequest: BudgetRequest = {
      ...activeRequest,
      status: statusVal,
      formInputAftersales: aftersalesInput,
      vehicles: isBudgetStaff ? editableVehicles : activeRequest.vehicles
    };

    // Prepare simulated dispatched email representation displaying beautiful SLA enterprise rules
    const ccList = [activeBranchConfig.emailBos];
    let replyCcInfo = '';

    // If active logged-in user is Budget Staff, append default admin backup CC:
    if (isBudgetStaff) {
      ccList.push(activeBranchConfig.emailTeamAdminCC);
      replyCcInfo = activeBranchConfig.emailTeamAdminCC;
    }

    const simEmail = {
      to: 'approver.finance@tunasrent.com',
      cc: ccList,
      replyCc: replyCcInfo,
      subject: `[${statusVal}] SLA Processing Request: ${activeRequest.namaCustomer} (Role: ${currentUser?.role || 'Team Admin'})`,
      body: `Dear Partners,

Role-based submission completed for:
- Customer: ${activeRequest.namaCustomer}
- Sector Business: ${activeRequest.bidangUsahaCustomer}
- Processing Branch: ${activeRequest.cabang}
- Approved Status: ${statusVal}

--------------------------------------------------
ROLE-SPECIFIC ARTIFACTS OR ENTRIES DETECTED:
- Executive Aftersales Notes: ${aftersalesInput || '(None supplied)'}
- Total Fleet Items Evaluated: ${editableVehicles.length}
- Calculated Maintenance Cost: IDR ${calculateTotalBudget().toLocaleString('id-ID')}
--------------------------------------------------

Authorized under secure login profile for ${currentUser?.name} (${currentUser?.role}).

Regards,
Aftersales Tunas Rent Budget Maintenance Gateway`
    };

    setEmailDetails(simEmail);
    setShowEmailReport(true);

    // Save actual model changes in state database
    onSave(updatedRequest);
    showToast(`Role request submitted for ${activeRequest.namaCustomer}.`);
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-outline-variant p-8 text-center select-none">
        <AlertTriangle className="w-12 h-12 text-secondary mx-auto mb-4" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">No Pending Requests In System</h3>
        <p className="text-on-surface-variant font-sans text-xs mt-2">
          Create some budget allocations in the MKT Request form first to inspect these role submit controls.
        </p>
      </div>
    );
  }

  const isStaff = currentUser?.role === 'Budget Staff';
  const totalCost = calculateTotalBudget();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Role Submission Portal</h2>
        <p className="text-on-surface-variant font-body-md mt-1">
          Specialized form workspace designed for **Team Admin** and **Budget Staff** roles to lock estimations and review SLAs.
        </p>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 font-body-md z-50">
          <CheckCircle className="w-5 h-5 text-[#30f283]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Simulated Email CC Routing Loader HUD */}
      {showEmailReport && emailDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-outline shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-surface-container border-b border-outline-variant flex justify-between items-center text-on-surface">
              <h3 className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary animate-pulse" />
                <span>Simulated Exchange Mail Dispatch Logs</span>
              </h3>
              <button 
                onClick={() => setShowEmailReport(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant border border-outline-variant/30 text-xs text-on-surface"
              >
                Skip preview
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2.5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 font-mono text-xs text-on-surface">
                <div className="grid grid-cols-6 gap-2">
                  <span className="col-span-1 text-on-surface-variant font-bold">To:</span>
                  <span className="col-span-5 font-semibold text-[#107C41]">{emailDetails.to}</span>
                </div>
                <div className="grid grid-cols-6 gap-2 border-t border-outline-variant/40 pt-1.5">
                  <span className="col-span-1 text-on-surface-variant font-bold">CC Bos:</span>
                  <span className="col-span-5 font-bold text-on-surface">{activeBranchConfig.emailBos}</span>
                </div>
                
                {isStaff && (
                  <div className="grid grid-cols-6 gap-2 border-t border-yellow-200 bg-amber-50/50 p-1.5 rounded border border-dashed pt-1.5">
                    <span className="col-span-1 text-amber-800 font-bold">CC Admin:</span>
                    <span className="col-span-5 font-black text-amber-900">{activeBranchConfig.emailTeamAdminCC}</span>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-2 border-t border-outline-variant/40 pt-1.5">
                  <span className="col-span-1 text-on-surface-variant font-bold">Subject:</span>
                  <span className="col-span-5 italic text-secondary font-sans">{emailDetails.subject}</span>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-outline hover:border-primary/30 transition-all font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed select-text">
                {emailDetails.body}
              </div>

              <div className="p-3 bg-primary-container/20 text-primary text-xs rounded-xl flex items-center justify-between font-bold font-sans">
                <span>⚡ Transmitting role SMTP packets...</span>
                <span>Auto-routing complete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout containing selection on left, role options on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Select Request Item */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-headline-sm font-semibold text-on-surface flex items-center gap-2 border-l-4 border-primary">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Select Active Budget Line</span>
          </div>

          <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto">
            <p className="text-xs text-on-surface-variant mb-2">
              Select any request below to load its details and process it.
            </p>
            {requests.map((r) => {
              const isActive = r.id === selectedRequestId;
              const isViolated = r.aging >= 7;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isActive 
                      ? 'bg-[#EAEFFF] border-primary ring-1 ring-primary/10' 
                      : 'bg-white border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-xs font-bold text-primary truncate block w-4/6">{r.namaCustomer}</span>
                    <span className={`text-[9px] uppercase font-sans font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'SUBMIT' 
                        ? 'bg-[#E7F5ED] text-[#107C41]' 
                        : r.status === 'PENDING' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-on-surface-variant">
                    <span>Cabang: <strong>{r.cabang}</strong></span>
                    <span>•</span>
                    <span className={`font-semibold ${isViolated ? 'text-error font-extrabold' : 'text-on-surface-variant'}`}>
                      SLA: {r.aging} days
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Role Submit Area */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden lg:col-span-2">
          {activeRequest ? (
            <form onSubmit={handleProcessSubmit}>
              {/* Header block summarizing active record details */}
              <div className="p-4 border-b border-outline-variant bg-surface flex flex-wrap justify-between items-center gap-3 border-l-4 border-[#107C41]">
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-sans">
                    Processing Details for <strong className="text-primary font-black">{activeRequest.namaCustomer}</strong>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Branch Area: <strong>{activeRequest.cabang}</strong> | Sector: {activeRequest.bidangUsahaCustomer}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-secondary-container-low p-2 rounded-lg border border-outline-variant/40">
                  <UserCheck className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider font-sans">
                    Role Workspace: {currentUser?.role || 'Team Admin'}
                  </span>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="p-6 space-y-6">
                
                {/* Visual Alert Notice */}
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/60 divide-y divide-outline-variant/40">
                  <div className="pb-3 text-xs text-on-surface font-sans leading-relaxed">
                    <strong className="block text-secondary text-[10px] uppercase tracking-wider mb-1 font-bold">
                      Marketing ATPM / Upgrade Request Notes:
                    </strong>
                    <p className="whitespace-pre-wrap text-[11px] font-mono leading-relaxed text-on-surface bg-white p-2.5 rounded border border-outline-variant/40">
                      {activeRequest.noteAtpm || 'No notes available.'}
                    </p>
                  </div>
                  <div className="pt-3 flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant">
                    <div>📅 Request Date: <strong>{activeRequest.tanggalRequest}</strong></div>
                    <div>📅 Submit Target: <strong>{activeRequest.tanggalSubmitBudget}</strong></div>
                    <div>⏳ Calendar SLA Index: <strong className={activeRequest.aging >= 7 ? 'text-error font-black' : 'text-primary font-bold'}>{activeRequest.aging} days</strong></div>
                  </div>
                </div>

                {/* ROLE COGNITIVE LOGIC DISCREPANCY BLOCK */}
                {isStaff ? (
                  /* BUDGET STAFF FORM PANEL: EDIT VEHICLE BUDGETS */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-primary-container/10 p-3 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Budget Maintenance Input Sheet</h4>
                          <p className="text-[10px] text-on-surface-variant">Provide the actual vehicle maintenance budget Rp lines.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider font-sans text-secondary block font-bold">Total Allocation Sum</span>
                        <span className="text-sm font-black text-primary font-mono">Rp {totalCost.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-outline-variant rounded-lg">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                            <th className="p-2.5 w-1/2">Unit Specifications</th>
                            <th className="p-2.5 w-1/8 text-center">Qty</th>
                            <th className="p-2.5 w-1/8 text-center">Year</th>
                            <th className="p-2.5 w-1/4 text-right">Budget Maintenance (per Unit)</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-outline-variant">
                          {editableVehicles.map(v => (
                            <tr key={v.id} className="hover:bg-surface-container/30">
                              <td className="p-2.5 font-sans font-medium">
                                <div>{v.jenisKendaraan || 'Unnamed vehicle specification'}</div>
                                <span className="text-[10px] text-on-surface-variant font-mono">Loc: {v.lokasiPemakaian} | Tenor: {v.tenor}mo</span>
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-on-surface">{v.qty}</td>
                              <td className="p-2.5 text-center font-mono text-on-surface-variant">{v.tahun}</td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[10px] text-on-surface-variant font-mono">Rp</span>
                                  <input
                                    type="number"
                                    required
                                    value={v.budgetMaintenance === null ? '' : v.budgetMaintenance}
                                    onChange={(e) => handleUpdateVehicleBudget(v.id, e.target.value)}
                                    placeholder="Enter Amount"
                                    className="w-32 px-2 py-1 text-right border border-outline-variant rounded bg-surface focus:border-primary font-mono text-xs"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* TEAM ADMIN FORM PANEL: STATUS REVIEW AND AFTERSALES DIRECTIVES */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 bg-secondary-container/10 p-3 rounded-xl border border-outline-variant/50">
                      <FileText className="w-5 h-5 text-secondary" />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">Aftersales Directives and Overrides Workspace</h4>
                        <p className="text-[10px] text-on-surface-variant">Write general notes, feedback, or update target SLA statuses.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Status switcher */}
                      <div className="md:col-span-1">
                        <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-2">
                          Approval status
                        </label>
                        <select
                          value={statusVal}
                          onChange={(e) => setStatusVal(e.target.value as any)}
                          className="w-full px-2.5 py-2 border border-outline-variant bg-surface rounded-lg text-xs font-semibold focus:border-primary"
                        >
                          <option value="Request">Request (Draft)</option>
                          <option value="SUBMIT">SUBMIT (Approved / Active)</option>
                          <option value="PENDING">PENDING (Needs Revision)</option>
                        </select>
                      </div>

                      {/* Info Cards showing totals */}
                      <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold block">Current Registered Fleet Rows</span>
                          <span className="text-xs font-bold font-sans text-on-surface block mt-0.5">{activeRequest.vehicles?.length || 0} Vehicle Specifications</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold block">Consolidated Maintenance Budget</span>
                          <span className="text-xs font-black font-mono text-primary block mt-0.5">
                            Rp {(activeRequest.vehicles?.reduce((s, c) => s + ((c.budgetMaintenance || 0) * (c.qty || 1)), 0) || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-2">
                        Form Input Aftersales (Notes, Directives or Override Logs)
                      </label>
                      <textarea
                        rows={4}
                        value={aftersalesInput}
                        onChange={(e) => setAftersalesInput(e.target.value)}
                        placeholder="Write directives or audit override logs here..."
                        className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-xs leading-relaxed focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Shared controls block */}
                <div className="pt-4 border-t border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
                  {/* Quick CC target info badge */}
                  <div className="flex items-center gap-1 bg-surface-container p-2 rounded border border-outline-variant/40">
                    <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      SMTP CC target: <strong>{activeBranchConfig.emailBos}</strong> 
                      {isStaff && <span> + Backup Room: <strong>{activeBranchConfig.emailTeamAdminCC}</strong></span>}
                    </span>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors transform active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {isStaff ? 'Lock & Submit Budget Metrics' : 'Process Review & Update'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-on-surface-variant italic font-sans select-none">
              Please click any request line on the left side to load review tools.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
