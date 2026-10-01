import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'candidate-login' | 'candidate-register' | 'hr-login') => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeView, onNavigate }) => {
  const { role, user, company, logout, quickDemoLogin } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-indigo-500 transition-colors">
              H
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                HireScreen
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Recruitment & Screening
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-white ${
              activeView === 'landing' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('jobs')}
            className={`transition-colors hover:text-white ${
              activeView === 'jobs' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Explore Jobs
          </button>
          <button
            onClick={() => onNavigate('workflow')}
            className={`transition-colors hover:text-white ${
              activeView === 'workflow' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('companies')}
            className={`transition-colors hover:text-white ${
              activeView === 'companies' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Companies
          </button>
        </nav>

        {/* Zone 3: Actions & Auth State */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Test HR Accounts (Company Isolated)
                </div>
                {[
                  { cid: 'INF001', name: 'Infosys HR' },
                  { cid: 'TCS001', name: 'TCS HR' },
                  { cid: 'WIP001', name: 'Wipro HR' },
                  { cid: 'ACC001', name: 'Accenture HR' },
                  { cid: 'HCL001', name: 'HCLTech HR' },
                  { cid: 'TM001', name: 'Tech Mahindra HR' }
                ].map((item) => (
                  <button
                    key={item.cid}
                    onClick={() => {
                      quickDemoLogin('hr', item.cid);
                      setShowDemoMenu(false);
                      onNavigate('hr-dashboard');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.cid}</span>
                  </button>
                ))}

                <div className="border-t border-slate-800 my-1.5"></div>
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Test Candidates
                </div>
                <button
                  onClick={() => {
                    quickDemoLogin('candidate', 'CAN_101');
                    setShowDemoMenu(false);
                    onNavigate('candidate-dashboard');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span>Rahul Kumar</span>
                  <span className="text-[10px] text-slate-400">Software Dev</span>
                </button>
                <button
                  onClick={() => {
                    quickDemoLogin('candidate', 'CAN_102');
                    setShowDemoMenu(false);
                    onNavigate('candidate-dashboard');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span>Priya Sharma</span>
                  <span className="text-[10px] text-slate-400">Frontend React</span>
                </button>
              </div>
            )}
          </div>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              {role === 'hr' ? (
                <button
                  onClick={() => onNavigate('hr-dashboard')}
                  className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[120px]">{company?.company_name || 'HR Portal'}</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('candidate-dashboard')}
                  className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[120px]">{(user as any).name || 'Candidate'}</span>
                </button>
              )}

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('candidate-login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg transition-colors"
              >
                Candidate Sign In
              </button>
              <button
                onClick={() => onOpenAuth('hr-login')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                HR Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
