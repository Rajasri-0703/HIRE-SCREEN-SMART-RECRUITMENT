import React from 'react';
import {
  Briefcase,
  ShieldCheck,
  Search,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users2,
  Building,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import { Company } from '../types/index';

interface LandingPageProps {
  onOpenAuth: (mode: 'candidate-login' | 'candidate-register' | 'hr-login') => void;
  onNavigateToJobs: () => void;
  companies: Company[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onNavigateToJobs,
  companies
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-slate-800/80">
        {/* Subtle radial glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-[350px] h-[200px] bg-cyan-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Quiet sub-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-indigo-400 font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation College & Enterprise Recruitment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 text-balance">
            Smart Recruitment.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
              Faster Screening.
            </span>{' '}
            Better Hiring.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
            HireScreen connects ambitious candidates with premier tech enterprises. Experience
            automated resume keyword extraction, transparent fit scoring, and strict multi-company
            data isolation built for modern hiring standards.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <button
              onClick={() => onOpenAuth('candidate-register')}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>I'm a Candidate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onOpenAuth('hr-login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4 text-indigo-400" />
              <span>I'm an HR Recruiter</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Multi-Company Isolation</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">Real-Time</div>
              <div className="text-xs text-slate-400 mt-0.5">Resume Fit Scoring</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">Automated</div>
              <div className="text-xs text-slate-400 mt-0.5">Candidate Pre-Ranking</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">6+</div>
              <div className="text-xs text-slate-400 mt-0.5">Enterprise Demo Portals</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECRUITMENT WORKFLOW DIAGRAM */}
      <section id="workflow" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2">
            End-To-End Architecture
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            How The Recruitment Workflow Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every step is connected: from resume extraction to interview coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Profile & Resume Upload',
              desc: 'Candidates upload PDF/DOCX resumes. The parser extracts tech skills, education, and years of experience automatically.',
              icon: FileCheck2
            },
            {
              step: '02',
              title: 'Automated Fit Scoring',
              desc: 'Rule-based scoring computes matching vs. missing skills, qualification fit, and returns a verified fit score before application.',
              icon: Cpu
            },
            {
              step: '03',
              title: 'Company HR Ingestion',
              desc: 'Applications route strictly to the designated company dashboard. Candidates are pre-ranked by fit score and tech alignment.',
              icon: ShieldCheck
            },
            {
              step: '04',
              title: 'Shortlisting & Interview',
              desc: 'HR reviews screening insights, shortlists candidates, and schedules technical interviews directly from the dashboard.',
              icon: Users2
            }
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-6 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl relative transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-indigo-400">{item.step}</span>
                <item.icon className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FOR CANDIDATES & FOR HR TEAMS (SPLIT COMPARISON) */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Candidates */}
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Job Seekers & Candidates</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Take the guesswork out of job hunting. See transparent keyword matching against
                real enterprise job requisitions before you submit.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time Fit Score calculation (e.g. 86% match) generated on resume upload</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Itemized Matching vs. Missing skills breakdown to optimize your qualifications</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Live status tracking: Applied, Under Review, Shortlisted, Interview Scheduled</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct interview schedule notifications with Google Meet links</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('candidate-register')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Build Candidate Profile</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* For HR Teams */}
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Corporate HR Recruiters</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Streamline screening with verifiable multi-tenant data isolation. Each recruiter
                only accesses their company's proprietary jobs, resumes, and candidates.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Strict company_id authorization prevents cross-company data leakage</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Automated candidate pre-ranking leaderboards by skills and experience</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Configurable scoring weights (Skills %, Education %, Experience %, Projects %)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Built-in interview scheduling with automatic status synchronization</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('hr-login')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Access HR Recruiter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. MULTI-COMPANY PORTALS (INFOSYS, TCS, WIPRO, ACCENTURE, HCLTECH, TECH MAHINDRA) */}
      <section id="companies" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2">
            Multi-Tenant Enterprise Architecture
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Verified Partner Company Demonstrations
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Each company operates on an isolated tenant partition. Try logging into different HR
            accounts to verify strict data separation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <div
              key={comp.company_id}
              className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold">
                  {comp.company_id}
                </span>
                <span className="text-[11px] text-slate-400">{comp.location}</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">{comp.company_name}</h4>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{comp.description}</p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Industry:</span>
                <span className="font-medium text-slate-300">{comp.industry}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT PLATFORM & COLLEGE PROJECT DISCLAIMER */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-2">Academic & Evaluation Project Context</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
            HireScreen is engineered as a full-stack recruitment prototype demonstrating relational
            role-based database access control, client/server file parsing, transparent rule-based
            screening algorithms, and multi-tenant security architecture. Company accounts and
            candidates are configured as demonstration records.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-indigo-400">
            <span>• Express & Node.js Backend</span>
            <span>• React & TypeScript Frontend</span>
            <span>• Tailored Scoring Engine</span>
            <span>• Strict Data Isolation</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-10 bg-[#070a11]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} HireScreen Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onNavigateToJobs} className="hover:text-slate-300 transition-colors">
              Find Jobs
            </button>
            <button onClick={() => onOpenAuth('candidate-login')} className="hover:text-slate-300 transition-colors">
              Candidate Login
            </button>
            <button onClick={() => onOpenAuth('hr-login')} className="hover:text-slate-300 transition-colors">
              HR Recruiter Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
