/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  FileEdit, 
  Settings, 
  CalendarDays,
  Menu,
  LogOut,
  X,
  UserCheck,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onLogOut?: () => void;
}

export default function Sidebar({
  currentScreen,
  onScreenChange,
  userEmail = 'admin@financehub.inc',
  userName = 'Admin User',
  userRole = 'Team Admin',
  mobileOpen = false,
  setMobileOpen,
  onLogOut
}: SidebarProps) {
  const mainMenu = [
    { id: 'dashboard', label: 'Dashboard SLA', icon: LayoutDashboard },
    { id: 'tasklist', label: 'Tasklist budget', icon: ClipboardList },
    { id: 'form-request', label: 'Form Request MKT', icon: FileEdit },
    { id: 'admin-budget-submit', label: 'Form Submit Admin & Budget', icon: UserCheck },
  ];

  const footerMenu = [
    { id: 'google-sheets-sync', label: 'Google Sheets DB', icon: Database },
    { id: 'settings', label: 'Settings & User', icon: Settings },
    { id: 'holidays', label: 'Master Libur', icon: CalendarDays },
  ];

  const handleNavClick = (screenId: string) => {
    onScreenChange(screenId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-surface-container-low border-r border-outline-variant p-4 justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-3 flex items-center gap-2.5 mb-5 border-b border-outline-variant pb-5">
          <div className="w-9 h-9 rounded bg-[#107C41] text-white flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
            ATR
          </div>
          <div>
            <h1 className="font-headline-sm text-xs font-black text-on-surface leading-tight">Aftersales Tunas Rent</h1>
            <p className="text-[9px] text-primary font-sans uppercase tracking-wider font-extrabold mt-0.5">Budget Maintenance</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans font-medium text-sm transition-all duration-150 transform active:scale-98 ${
                  isActive
                    ? 'bg-secondary-container text-primary font-bold border-r-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Footer Navigation */}
        <div className="pt-4 border-t border-outline-variant">
          <nav className="space-y-1 mb-4">
            {footerMenu.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans font-medium text-sm transition-all duration-150 transform active:scale-98 ${
                    isActive
                      ? 'bg-secondary-container text-primary font-bold border-r-2 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* User Section with LogOut callback */}
          <div className="p-3 bg-surface-container-high/40 rounded-xl border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm shrink-0 border border-outline-variant">
                {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate leading-tight">{userName}</p>
                <span className="inline-block text-[9px] bg-[#EAEFFF] text-primary px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase font-sans mt-0.5">
                  {userRole}
                </span>
                <p className="text-[10px] text-on-surface-variant truncate font-mono mt-0.5">{userEmail}</p>
              </div>
            </div>

            {onLogOut && (
              <button
                onClick={onLogOut}
                className="w-full py-1.5 border border-outline-variant hover:border-error/30 hover:bg-error-container/10 text-on-surface-variant hover:text-error transition-all rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out secure</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, fixed left) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar (animated sliding panel) */}
      <aside 
        className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-surface z-50 transition-transform duration-300 transform border-r border-outline-variant ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button on Menu */}
        <button 
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-full transition-colors z-50 border border-outline-variant/20 bg-surface shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
}
