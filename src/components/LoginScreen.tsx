/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  userAccounts: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginScreen({
  userAccounts,
  onLoginSuccess
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      // Find matching user
      const matchedUser = userAccounts.find(
        usr => usr.username.toLowerCase() === username.trim().toLowerCase() && 
               usr.password === password
      );

      setIsLoading(false);

      if (matchedUser) {
        setSuccessMsg(`Welcome back, ${matchedUser.name}!`);
        setTimeout(() => {
          onLoginSuccess(matchedUser);
        }, 1000);
      } else {
        setErrorMsg('Invalid username or password. Check the credentials table below.');
      }
    }, 800);
  };

  // Quick fill helper for the user's convenience
  const handleQuickFill = (user: UserAccount) => {
    setUsername(user.username);
    setPassword(user.password || '');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none relative overflow-hidden">
      
      {/* Background ambient details to match pristine look */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Main card box */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-outline-variant shadow-lg overflow-hidden flex flex-col">
        
        {/* Brand Banner */}
        <div className="bg-surface-container-low border-b border-outline-variant p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shadow-xs mb-3">
            <Building2 className="text-on-primary w-6 h-6" />
          </div>
          <h1 className="font-headline-md text-headline-md font-extrabold text-on-surface leading-tight">
            Finance Hub Gateway
          </h1>
          <p className="text-xs text-on-surface-variant font-sans tracking-wide uppercase mt-1.5 font-bold">
            Budget Maintenance &amp; SLA Controls
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-error-container/10 border border-error/20 text-error rounded-lg flex items-start gap-2.5 text-xs font-medium animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-error" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-secondary-container text-primary rounded-lg flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary-container disabled:bg-primary/80 transition-colors rounded-lg font-sans font-bold text-sm shadow-xs flex items-center justify-center gap-2 transform active:scale-99"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In secure</span>
            )}
          </button>
        </form>

        {/* Credentials Sandbox Directory helper - VERY elegant system larping */}
        <div className="border-t border-outline-variant bg-surface-container-low p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
              Prototype Login Profiles
            </h4>
          </div>
          <div className="space-y-2">
            {userAccounts.map(account => (
              <div 
                key={account.id}
                onClick={() => handleQuickFill(account)}
                className="flex items-center justify-between p-2 rounded-lg border border-outline-variant bg-white hover:bg-secondary-container/10 cursor-pointer transition-all hover:scale-[1.01] group active:scale-99"
                title="Click to auto-fill"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary">
                    {account.name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate font-mono">
                    User: {account.username} | Pass: {account.password}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide shrink-0 ${
                  account.role === 'Team Admin' 
                    ? 'bg-primary-container/10 text-primary border border-primary/20' 
                    : 'bg-secondary-container text-on-secondary-container border border-outline-variant/30'
                }`}>
                  {account.role}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant font-sans text-center mt-3">
            💡 Click on any pilot profile box above to auto-fill credentials.
          </p>
        </div>
      </div>

      {/* Under-card copyright footer */}
      <p className="text-xs text-on-surface-variant/70 font-sans mt-6 text-center">
        Confidential Application. Registered with Tunas Rent Co. Indonesia &copy; 2026.
      </p>
    </div>
  );
}
