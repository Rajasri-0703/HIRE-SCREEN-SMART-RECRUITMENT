/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModals';
import { CandidateDashboard } from './components/CandidateDashboard';
import { HRDashboard } from './components/HRDashboard';
import { api } from './services/api';
import { Company, Job } from './types/index';
import { ResumeScreeningModal } from './components/ResumeScreeningModal';
import { Search, ArrowRight, Check } from 'lucide-react';

function MainApp() {
  const { role, user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'candidate-login' | 'candidate-register' | 'hr-login'>('candidate-login');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [exploreJobs, setExploreJobs] = useState<Job[]>([]);
  const [selectedJobForScreening, setSelectedJobForScreening] = useState<Job | null>(null);

  // Load companies & public jobs for landing exploration
  useEffect(() => {
    api.getCompanies()
      .then((res) => setCompanies(res.companies))
      .catch((err) => console.error('Error fetching companies:', err));

    api.getJobs()
      .then((res) => setExploreJobs(res.jobs))
      .catch((err) => console.error('Error fetching jobs:', err));
  }, []);

  // Sync active view based on logged in user
  useEffect(() => {
    if (role === 'candidate' && (activeView === 'landing' || activeView === 'hr-dashboard')) {
      setActiveView('candidate-dashboard');
    } else if (role === 'hr' && (activeView === 'landing' || activeView === 'candidate-dashboard')) {
      setActiveView('hr-dashboard');
    }
  }, [role]);

  const handleOpenAuth = (mode: 'candidate-login' | 'candidate-register' | 'hr-login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading HireScreen Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'candidate-dashboard' && role !== 'candidate') {
            handleOpenAuth('candidate-login');
            return;
          }
          if (view === 'hr-dashboard' && role !== 'hr') {
            handleOpenAuth('hr-login');
            return;
          }
          setActiveView(view);
        }}
      />

      {/* VIEW 1: CANDIDATE DASHBOARD */}
      {role === 'candidate' && activeView === 'candidate-dashboard' && (
        <CandidateDashboard />
      )}

      {/* VIEW 2: HR DASHBOARD (STRICT COMPANY ISOLATION) */}
      {role === 'hr' && activeView === 'hr-dashboard' && (
        <HRDashboard />
      )}

      {/* VIEW 3: PUBLIC / LANDING PAGE */}
      {activeView === 'landing' && (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onNavigateToJobs={() => setActiveView('jobs')}
          companies={companies}
        />
      )}

      {/* VIEW 4: PUBLIC EXPLORE JOBS VIEW */}
      {activeView === 'jobs' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Open Opportunities</h1>
              <p className="text-xs text-slate-400 mt-1">
                Browse positions from Infosys, TCS, Wipro, Accenture, HCLTech, and Tech Mahindra.
              </p>
            </div>

            <button
              onClick={() => handleOpenAuth('candidate-login')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Sign In to Screen & Apply
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exploreJobs.map((job) => (
              <div
                key={job.job_id}
                className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">{job.company_name}</span>
                      <h3 className="text-base font-bold text-white leading-snug">{job.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      {job.employment_type}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.experience_requirement} yr(s) exp</span>
                    {job.salary_range && <span>· {job.salary_range}</span>}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.required_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Deadline: {job.deadline}</span>
                  {role === 'candidate' ? (
                    <button
                      onClick={() => setSelectedJobForScreening(job)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <span>Screen & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenAuth('candidate-login')}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: WORKFLOW EXPLANATION */}
      {activeView === 'workflow' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Recruitment Workflow</h1>
            <p className="text-sm text-slate-400 mt-1">
              Detailed breakdown of how candidate screening, fit score calculation, and HR evaluation function.
            </p>
          </div>

          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6 text-xs text-slate-300">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">1. Candidate Resume Ingestion</h3>
              <p className="text-slate-400 leading-relaxed">
                When a candidate applies for an active job, their resume (PDF, DOCX, or text) is parsed on demand.
                The system extracts technical proficiencies, education degree credentials, verified years of experience,
                and key engineering projects.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">2. Transparent Rule-Based Fit Scoring Engine</h3>
              <p className="text-slate-400 leading-relaxed">
                Rather than an opaque black box, HireScreen implements a transparent, verifiable multi-factor score:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong>Skills Match (50% default):</strong> Normalizes and compares listed tech keywords against job requisition requirements.</li>
                <li><strong>Education Match (20% default):</strong> Validates degree qualification (B.Tech, B.E, MCA, M.Tech).</li>
                <li><strong>Experience Match (20% default):</strong> Compares verified candidate tenure against minimum required experience.</li>
                <li><strong>Projects & Certifications (10% default):</strong> Awards credits for proven implementations and relevant certificates.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">3. Multi-Company Tenant Security</h3>
              <p className="text-slate-400 leading-relaxed">
                Each HR account is partitioned by <code>company_id</code> (e.g. INF001, TCS001, WIP001).
                The backend strictly queries and filters data using the authenticated company ID, guaranteeing that
                no recruiter can access another enterprise's talent pool or private requisitions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: COMPANIES VIEW */}
      {activeView === 'companies' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Partner Enterprises</h1>
            <p className="text-xs text-slate-400 mt-1">
              Demo enterprise accounts configured for the recruitment platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((c) => (
              <div key={c.company_id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-indigo-400 font-bold">{c.company_id}</span>
                  <span className="text-[11px] text-slate-400">{c.location}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{c.company_name}</h3>
                <div className="text-xs text-slate-400 mb-3">{c.industry}</div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{c.description}</p>
                <button
                  onClick={() => handleOpenAuth('hr-login')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors"
                >
                  Sign In as {c.company_name} HR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Candidate Screening Modal (when screening from public jobs view) */}
      {selectedJobForScreening && (
        <ResumeScreeningModal
          job={selectedJobForScreening}
          isOpen={true}
          onClose={() => setSelectedJobForScreening(null)}
          onApplicationSubmitted={() => {
            setActiveView('candidate-dashboard');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
