/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  HelpCircle, 
  User as UserIcon,
  CheckCircle,
  Building2 
} from 'lucide-react';

import { 
  BudgetRequest, 
  Holiday, 
  AppSettings, 
  BRANCHES, 
  INITIAL_HOLIDAYS, 
  getSeededBudgetRequests,
  UserAccount,
  BranchCcConfig,
  INITIAL_USER_ACCOUNTS,
  INITIAL_BRANCH_CC_CONFIGS
} from './types';

import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import FormRequestScreen from './components/FormRequestScreen';
import TasklistScreen from './components/TasklistScreen';
import HolidayScreen from './components/HolidayScreen';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';
import AdminBudgetSubmitScreen from './components/AdminBudgetSubmitScreen';
import GoogleSheetsConfigScreen from './components/GoogleSheetsConfigScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // User Accounts & CC configurations databases (persisted in localStorage)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('fh_user_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  const [branchCcConfigs, setBranchCcConfigs] = useState<BranchCcConfig[]>(() => {
    const saved = localStorage.getItem('fh_branch_cc_configs');
    return saved ? JSON.parse(saved) : INITIAL_BRANCH_CC_CONFIGS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('fh_current_user');
    // Default to the Tunas Rent Admin master account so application is instantly explored
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS[0];
  });

  // Core Persisted Databases
  const [requests, setRequests] = useState<BudgetRequest[]>(() => {
    const saved = localStorage.getItem('fh_budget_requests');
    return saved ? JSON.parse(saved) : getSeededBudgetRequests();
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem('fh_holidays');
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fh_settings');
    return saved ? JSON.parse(saved) : {
      criticalAgingThreshold: 7,
      activeBranches: [...BRANCHES],
      autoRefreshInterval: 0,
      theme: 'light'
    };
  });

  const [userName, setUserName] = useState<string>('Admin User');
  const [userEmail, setUserEmail] = useState<string>('admin@financehub.inc');
  const [userRole, setUserRole] = useState<string>('Team Admin');

  const [editingRequest, setEditingRequest] = useState<BudgetRequest | null>(null);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  // Keep displayName & emails synced with currently logged-in object
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name);
      setUserEmail(currentUser.email);
      setUserRole(currentUser.role);
      localStorage.setItem('fh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fh_current_user');
    }
  }, [currentUser]);

  // Sync state changes to local storage
  useEffect(() => {
    localStorage.setItem('fh_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('fh_branch_cc_configs', JSON.stringify(branchCcConfigs));
  }, [branchCcConfigs]);

  useEffect(() => {
    localStorage.setItem('fh_budget_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('fh_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('fh_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast trigger helper
  const triggerGlobalToast = (msg: string) => {
    setGlobalNotification(msg);
    setTimeout(() => setGlobalNotification(null), 3050);
  };

  // Budget Request state operations
  const handleSaveRequest = (updatedReq: BudgetRequest) => {
    const exists = requests.some(r => r.id === updatedReq.id);
    if (exists) {
      setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
      triggerGlobalToast(`Budget Request metadata updated.`);
    } else {
      setRequests(prev => [updatedReq, ...prev]);
      triggerGlobalToast(`Successfully submitted dynamic budget allocation for ${updatedReq.namaCustomer}.`);
    }
    setEditingRequest(null);
    setCurrentScreen('tasklist'); // Route back to table view
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm('Are you sure you want to delete this marketing budget request?')) {
      setRequests(prev => prev.filter(r => r.id !== id));
      triggerGlobalToast('Budget Request deleted.');
    }
  };

  const handleEditRowTrigger = (req: BudgetRequest) => {
    setEditingRequest(req);
    setCurrentScreen('form-request'); // Route to edit-ready input form
  };

  const handleAddNewRequestTrigger = () => {
    setEditingRequest(null);
    setCurrentScreen('form-request'); // Route to brand-new input form
  };

  const handleCancelForm = () => {
    setEditingRequest(null);
    setCurrentScreen('tasklist');
  };

  // Holidays state operations
  const handleAddHoliday = (newHol: Holiday) => {
    setHolidays(prev => [newHol, ...prev]);
  };

  const handleEditHoliday = (updatedHol: Holiday) => {
    setHolidays(prev => prev.map(h => h.id === updatedHol.id ? updatedHol : h));
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  // Reset database back to default initial parameters
  const handleResetDatabase = () => {
    setRequests(getSeededBudgetRequests());
    setHolidays(INITIAL_HOLIDAYS);
    setSettings({
      criticalAgingThreshold: 7,
      activeBranches: [...BRANCHES],
      autoRefreshInterval: 0,
      theme: 'light'
    });
    setUserAccounts(INITIAL_USER_ACCOUNTS);
    setBranchCcConfigs(INITIAL_BRANCH_CC_CONFIGS);
    setCurrentUser(INITIAL_USER_ACCOUNTS[0]);
    setEditingRequest(null);
    setCurrentScreen('dashboard');
    triggerGlobalToast('Seed Mock databases and accounts restored successfully.');
  };

  // Switch / Sign-out handle
  const handleSignOut = () => {
    setCurrentUser(null);
    triggerGlobalToast('Signed out successfully. Credentials locked.');
  };

  // Screen Routing Renderer
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            requests={requests} 
            criticalAgingThreshold={settings.criticalAgingThreshold}
          />
        );
      case 'tasklist':
        return (
          <TasklistScreen
            requests={requests}
            onAddNewRequest={handleAddNewRequestTrigger}
            onEditRequest={handleEditRowTrigger}
            onDeleteRequest={handleDeleteRequest}
          />
        );
      case 'form-request':
        return (
          <FormRequestScreen
            editingRequest={editingRequest}
            onSave={handleSaveRequest}
            onCancel={handleCancelForm}
            branchCcConfigs={branchCcConfigs}
            currentUser={currentUser}
          />
        );
      case 'admin-budget-submit':
        return (
          <AdminBudgetSubmitScreen
            requests={requests}
            onSave={(updatedReq) => {
              setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
              triggerGlobalToast(`Budget Request updated successfully under role auth.`);
            }}
            branchCcConfigs={branchCcConfigs}
            currentUser={currentUser}
          />
        );
      case 'google-sheets-sync':
        return (
          <GoogleSheetsConfigScreen
            requests={requests}
          />
        );
      case 'holidays':
        return (
          <HolidayScreen
            holidays={holidays}
            onAddHoliday={handleAddHoliday}
            onEditHoliday={handleEditHoliday}
            onDeleteHoliday={handleDeleteHoliday}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            userName={userName}
            onUpdateUserName={(name) => {
              setUserName(name);
              if (currentUser) {
                setCurrentUser({ ...currentUser, name });
              }
            }}
            userEmail={userEmail}
            onUpdateUserEmail={(email) => {
              setUserEmail(email);
              if (currentUser) {
                setCurrentUser({ ...currentUser, email });
              }
            }}
            onResetDatabase={handleResetDatabase}
            userAccounts={userAccounts}
            onUpdateUserAccounts={setUserAccounts}
            branchCcConfigs={branchCcConfigs}
            onUpdateBranchCcConfigs={setBranchCcConfigs}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <DashboardScreen 
            requests={requests} 
            criticalAgingThreshold={settings.criticalAgingThreshold}
          />
        );
    }
  };

  // Secure Sign-in interceptor: If no user session exists or is explicitly signed out, present the gorgeous auth portal!
  if (!currentUser) {
    return (
      <LoginScreen
        userAccounts={userAccounts}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerGlobalToast(`Welcome, ${user.name}! Authorized as "${user.role}"`);
          setCurrentScreen('dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body-md text-on-background select-none">
      {/* Dynamic Floating Global Notification Toast */}
      {globalNotification && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 font-body-md z-50 animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#30f283]" />
          <span>{globalNotification}</span>
        </div>
      )}

      {/* Global Navigation docked Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogOut={handleSignOut}
      />

      {/* Outer Content Layout offsets left sidebar for desktop widths */}
      <div className="flex-grow flex flex-col md:ml-64 h-full overflow-hidden">
        
        {/* Global Top Navigation Bar */}
        <header className="h-16 border-b border-outline-variant bg-surface px-6 md:px-8 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center gap-4">
            {/* Hamburger menu trigger for Mobiles */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/30 bg-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-headline-md text-base md:text-md font-black text-primary select-none hidden sm:block">Aftersales Tunas Rent , Budget Maintenance</h1>
            <div className="sm:hidden flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold text-sm leading-none pt-0.5">Budget Maintenance</span>
            </div>
          </div>

          {/* Quick Info & Notifications indicators */}
          <div className="flex items-center gap-3">
            {/* Display Role header badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-sans bg-[#EAEFFF] text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>Session: {currentUser.role}</span>
            </span>

            <button 
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full relative transition-colors shadow-xs"
              onClick={() => triggerGlobalToast("Current Active Alerts: 0. Database is synchronized.")}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#107C41] rounded-full animate-pulse" />
            </button>
            <button 
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors shadow-xs"
              onClick={() => alert(`Enterprise Finance Hub\nSLA Calibration & Budget Tracking Module v1.0.1\n\nAuthorized User: ${userName}\nRole Group: ${currentUser.role}\nEmail Destination: ${userEmail}`)}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Primary Page Canvas (Scrollable viewport) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-surface">
          <div className="max-w-[1500px] mx-auto w-full animate-in fade-in duration-300">
            {renderActiveScreen()}
          </div>
        </main>
      </div>
    </div>
  );
}
