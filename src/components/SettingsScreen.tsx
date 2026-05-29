/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Sliders, 
  Database, 
  CheckCircle,
  RotateCcw,
  Mail,
  UserPlus,
  Trash2,
  Lock,
  Building,
  KeyRound,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { AppSettings, BRANCHES, UserAccount, BranchCcConfig } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  userEmail: string;
  onUpdateUserEmail: (email: string) => void;
  onResetDatabase: () => void;
  
  // Live authentication state
  userAccounts: UserAccount[];
  onUpdateUserAccounts: (accounts: UserAccount[]) => void;
  branchCcConfigs: BranchCcConfig[];
  onUpdateBranchCcConfigs: (configs: BranchCcConfig[]) => void;
  currentUser: UserAccount | null;
}

export default function SettingsScreen({
  settings,
  onUpdateSettings,
  userName,
  onUpdateUserName,
  userEmail,
  onUpdateUserEmail,
  onResetDatabase,
  userAccounts,
  onUpdateUserAccounts,
  branchCcConfigs,
  onUpdateBranchCcConfigs,
  currentUser
}: SettingsScreenProps) {
  // Local config states
  const [localThreshold, setLocalThreshold] = useState(settings.criticalAgingThreshold);
  const [localBranches, setLocalBranches] = useState<string[]>(settings.activeBranches);
  const [localUserName, setLocalUserName] = useState(userName);
  const [localUserEmail, setLocalUserEmail] = useState(userEmail);
  const [showToastMsg, setShowToastMsg] = useState<string | null>(null);

  // New states for User Accounts management
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Team Admin' | 'Budget Staff'>('Budget Staff');

  // Branch CC lists map
  const [editableCcConfigs, setEditableCcConfigs] = useState<BranchCcConfig[]>(branchCcConfigs);

  const triggerToast = (msg: string) => {
    setShowToastMsg(msg);
    setTimeout(() => setShowToastMsg(null), 3000);
  };

  const handleToggleBranch = (branch: string) => {
    if (localBranches.includes(branch)) {
      if (localBranches.length <= 1) {
        triggerToast('At least one active regional branch must remain selected.');
        return;
      }
      setLocalBranches(localBranches.filter(b => b !== branch));
    } else {
      setLocalBranches([...localBranches, branch]);
    }
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      criticalAgingThreshold: localThreshold,
      activeBranches: localBranches
    });
    triggerToast('System SLA configuration updated.');
  };

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localUserName.trim()) {
      triggerToast('Administrator Name cannot be empty.');
      return;
    }
    onUpdateUserName(localUserName);
    onUpdateUserEmail(localUserEmail);
    // Auto sync back to current user account if matches
    if (currentUser) {
      const updatedAccounts = userAccounts.map(acc => {
        if (acc.id === currentUser.id) {
          return { ...acc, name: localUserName, email: localUserEmail };
        }
        return acc;
      });
      onUpdateUserAccounts(updatedAccounts);
    }
    triggerToast('User credentials updated.');
  };

  // Branch CC inputs update handlers
  const handleUpdateCcEmail = (cabangName: string, field: 'emailBos' | 'emailTeamAdminCC', value: string) => {
    const updated = editableCcConfigs.map(cfg => {
      if (cfg.cabang === cabangName) {
        return { ...cfg, [field]: value };
      }
      return cfg;
    });
    setEditableCcConfigs(updated);
    onUpdateBranchCcConfigs(updated);
  };

  // Add a new user account
  const handleAddUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newDisplayName.trim() || !newEmail.trim()) {
      triggerToast('All user registration parameters are required.');
      return;
    }

    // Check duplicate username
    if (userAccounts.some(acc => acc.username.toLowerCase() === newUsername.toLowerCase())) {
      triggerToast('Username is already registered.');
      return;
    }

    const payload: UserAccount = {
      id: `usr-${Math.floor(Math.random() * 100000)}`,
      username: newUsername.trim(),
      password: newPassword,
      name: newDisplayName.trim(),
      email: newEmail.trim(),
      role: newRole
    };

    const nextUserList = [...userAccounts, payload];
    onUpdateUserAccounts(nextUserList);
    triggerToast(`Added subscriber user "${payload.name}" successfully.`);
    
    // reset form
    setNewUsername('');
    setNewPassword('');
    setNewDisplayName('');
    setNewEmail('');
  };

  // Delete a user account
  const handleDeleteUserAccount = (id: string, name: string) => {
    if (currentUser && currentUser.id === id) {
      triggerToast('Forbidden: Cannot delete the currently authenticated active session.');
      return;
    }
    if (userAccounts.length <= 1) {
      triggerToast('At least one master administrator account must remain.');
      return;
    }
    if (confirm(`Remove user login profile for "${name}"?`)) {
      const nextUserList = userAccounts.filter(acc => acc.id !== id);
      onUpdateUserAccounts(nextUserList);
      triggerToast(`Removed user ${name}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Configuration Control Panel</h2>
        <p className="text-on-surface-variant font-body-md mt-1">
          Manage system security accounts, roles distribution, and regional boss CC emails configurations.
        </p>
      </div>

      {showToastMsg && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 font-body-md z-50">
          <CheckCircle className="w-5 h-5 text-[#30f283]" />
          <span>{showToastMsg}</span>
        </div>
      )}

      {/* Grid Layout containing 3 core panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* Panel 1: Branch Boss Escalation & CC Mapping (IND: Email Bos per Cabang) */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden xl:col-span-2">
          <div className="p-4 border-b border-outline-variant bg-surface flex items-center justify-between font-headline-sm font-semibold text-on-surface border-l-4 border-primary">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>Email CC per Cabang Layout</span>
            </div>
            <span className="text-xs bg-primary-container/10 text-primary px-3 py-1 rounded-full font-bold">
              Automatic Mail routing
            </span>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Set the <strong>Boss Email address</strong> (<em>Email Bos</em>) for each branch area that automatically receives CC copies when sending budget approvals. Additionally configure the default <strong>Admin Team CC</strong> which acts as an automatic backup receiver if "Budget Staff" responds to messages.
            </p>

            <div className="overflow-x-auto border border-outline-variant/60 rounded-lg">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-3 w-1/4">Cabang</th>
                    <th className="p-3 w-3/8">Email Bos (CC Utama)</th>
                    <th className="p-3 w-3/8">Admin Team CC (Rujukan Balasan SLA)</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-on-surface divide-y divide-outline-variant">
                  {editableCcConfigs.map(cfg => (
                    <tr key={cfg.cabang} className="hover:bg-surface-container-low/40">
                      {/* Branch Column */}
                      <td className="p-3 font-sans font-bold text-on-surface flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-secondary" />
                        <span>{cfg.cabang}</span>
                      </td>

                      {/* Boss Email Input */}
                      <td className="p-2">
                        <input
                          type="email"
                          value={cfg.emailBos}
                          onChange={(e) => handleUpdateCcEmail(cfg.cabang, 'emailBos', e.target.value)}
                          placeholder={`bos.${cfg.cabang.toLowerCase()}@tunasrent.com`}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant rounded text-xs focus:outline-hidden focus:border-primary font-mono"
                        />
                      </td>

                      {/* Admin CC Email Input */}
                      <td className="p-2">
                        <input
                          type="email"
                          value={cfg.emailTeamAdminCC}
                          onChange={(e) => handleUpdateCcEmail(cfg.cabang, 'emailTeamAdminCC', e.target.value)}
                          placeholder={`admin.${cfg.cabang.toLowerCase()}@tunasrent.com`}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant rounded text-xs focus:outline-hidden focus:border-primary font-mono"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-secondary-container/10 border border-outline-variant/60 rounded-xl text-xs text-on-surface-variant flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>CC Logic:</strong> When a request is logged, emails are calculated using these active parameters. If responses are logged by a user registered with the <strong>Budget Staff</strong> role, the system instantly appends the corresponding <em>Admin Team CC</em> destination.
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: User Account Administration (IND: User & Password Login) */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-outline-variant bg-surface flex items-center gap-2 font-headline-sm font-semibold text-on-surface border-l-4 border-[#107C41]">
              <KeyRound className="w-5 h-5 text-[#107C41]" />
              <span>User Sign-In Accounts</span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Add, configure, or review usernames and passwords authorized to login into the SLA calculation systems.
              </p>

              {/* Active Users List */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {userAccounts.map(acc => {
                  const isMe = currentUser?.id === acc.id;
                  return (
                    <div 
                      key={acc.id}
                      className={`p-3 rounded-lg border flex justify-between items-center bg-white ${
                        isMe ? 'border-[#107C41] bg-[#E7F5ED]/30' : 'border-outline-variant'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface truncate">{acc.name}</span>
                          {isMe && (
                            <span className="text-[9px] bg-[#107C41] text-white px-1.5 py-0.5 rounded-full font-sans uppercase font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          U: {acc.username} | P: {acc.password} | Role: <strong className="font-semibold">{acc.role}</strong>
                        </p>
                        <p className="text-[10px] text-on-surface-variant block font-mono">
                          📧 {acc.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteUserAccount(acc.id, acc.name)}
                        className={`p-1.5 rounded hover:bg-error-container/25 text-on-surface-variant hover:text-error transition-all ${
                          isMe ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title="Remove user credentials"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New User form */}
              <form onSubmit={handleAddUserAccount} className="p-4 bg-surface-container rounded-xl border border-outline-variant/60 space-y-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                  Register User Credentials
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. budi_rent"
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-hidden focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">Passcode</label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-hidden focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="e.g. Budi Hartono"
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-hidden focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'Team Admin' | 'Budget Staff')}
                      className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface select-none outline-hidden h-8"
                    >
                      <option value="Team Admin">Team Admin</option>
                      <option value="Budget Staff">Budget Staff</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="budi@tunasrent.com"
                    className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-hidden focus:border-primary font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-md flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Profile</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel 3: Account Profile & SLA Analysis Controls (Right Panel) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface flex items-center gap-2 font-headline-sm font-semibold text-on-surface border-l-4 border-primary">
              <Sliders className="w-5 h-5 text-primary" />
              <span>SLA Analysis Controls</span>
            </div>
            
            <form onSubmit={handleSaveSystemSettings} className="p-6 space-y-6">
              {/* Static SLA Display (Slider Removed per User Request) */}
              <div className="p-3.5 bg-primary-container/10 border border-primary/20 rounded-xl text-xs text-on-surface-variant space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Standard Corporate SLA Constraint
                </span>
                <p className="text-xs text-on-surface font-semibold font-sans">
                  SLA Violation target is locked to <strong>7 days</strong>.
                </p>
                <p className="text-[11px] text-on-surface-variant font-sans">
                  System triggers critical warnings automatically when any marketing request aging breaches or meets this maximum calendar duration threshold. This is managed enterprise-wide and cannot be altered locally.
                </p>
              </div>

              {/* Branch active checklist */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2 font-sans">
                  Active Regional Branches Focus
                </label>
                <p className="text-xs text-on-surface-variant mb-4 font-sans font-medium">
                  Toggle which regional subsidiaries to project active metrics for on the primary Dashboard table columns.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {BRANCHES.map(branch => {
                    const isActive = localBranches.includes(branch);
                    return (
                      <button
                        type="button"
                        key={branch}
                        onClick={() => handleToggleBranch(branch)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold font-sans transition-all active:scale-97 text-left ${
                          isActive
                            ? 'bg-[#EAEFFF] border-primary text-primary'
                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-primary border-primary' : 'bg-white border-outline-variant'
                        }`}>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{branch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save trigger */}
              <div className="pt-4 border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container text-sm font-bold rounded-lg shadow-sm transition-colors"
                >
                  Save SLA Options
                </button>
              </div>
            </form>
          </div>

          {/* Profile form */}
          <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface flex items-center gap-2 font-headline-sm font-semibold text-on-surface border-l-4 border-primary">
              <User className="w-5 h-5 text-primary" />
              <span>Session Credentials</span>
            </div>

            <form onSubmit={handleSaveProfileSettings} className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2 pb-1 bg-surface-container/30 p-2.5 rounded-xl border border-outline-variant/30">
                <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-headline-sm font-black border border-outline-variant shadow-xs shrink-0 select-none">
                  {localUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-bold text-sm text-on-surface truncate">{localUserName || 'Admin User'}</h4>
                  <p className="font-sans text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3 text-secondary" />
                    <span>Role: {currentUser?.role || 'Team Admin'}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={localUserName}
                  onChange={(e) => setLocalUserName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Associated Email
                </label>
                <input
                  type="email"
                  required
                  value={localUserEmail}
                  onChange={(e) => setLocalUserEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary transition-all font-mono"
                />
              </div>

              <div className="pt-2 border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Save Active profile
                </button>
              </div>
            </form>
          </div>

          {/* Database maintenance settings card */}
          <div className="bg-white rounded-xl border border-outline-variant shadow-xs p-5 flex flex-col justify-between overflow-hidden">
            <h4 className="font-sans font-bold text-sm text-on-surface flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-secondary" />
              <span>Diagnostic System Recovery</span>
            </h4>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
              Restores seed prototype matrices. Resets budget requests to default data entries count.
            </p>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to restore default prototype seed databases? Your customized lists will be reset.')) {
                    onResetDatabase();
                    triggerToast('Default seeded datasets restored.');
                  }
                }}
                className="px-4 py-2 border border-error text-error hover:bg-error-container/15 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seed Mock Data</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
