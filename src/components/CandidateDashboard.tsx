import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, Candidate, Interview, Job, Notification, Resume } from '../types/index';
import { ResumeScreeningModal } from './ResumeScreeningModal';
import {
  LayoutDashboard,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Building,
  Calendar,
  Bell,
  Settings,
  User,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'find-jobs' | 'applications' | 'resumes' | 'interviews' | 'notifications' | 'profile'
  >('dashboard');

  // Stats & Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Find Jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');

  // Job Screening Modal
  const [selectedJobForScreening, setSelectedJobForScreening] = useState<Job | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState<Partial<Candidate>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const candidate = user as Candidate;

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, jobsRes, appsRes, resumesRes, intsRes, notifsRes] = await Promise.all([
        api.getCandidateDashboard(),
        api.getJobs(),
        api.getCandidateApplications(),
        api.getCandidateResumes(),
        api.getCandidateInterviews(),
        api.getCandidateNotifications()
      ]);

      setDashboardData(dashRes);
      setJobs(jobsRes.jobs);
      setApplications(appsRes.applications);
      setResumes(resumesRes.resumes);
      setInterviews(intsRes.interviews);
      setNotifications(notifsRes.notifications);
      if (candidate) {
        setProfileForm({
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          education: candidate.education,
          skills: candidate.skills,
          experience_years: candidate.experience_years,
          preferred_role: candidate.preferred_role,
          preferred_location: candidate.preferred_location
        });
      }
    } catch (err) {
      console.error('Failed to load candidate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFilterJobs = async () => {
    try {
      const res = await api.getJobs({
        query: searchQuery,
        company: companyFilter,
        location: locationFilter,
        employment_type: typeFilter,
        experience: experienceFilter
      });
      setJobs(res.jobs);
    } catch (err) {
      console.error('Job filter failed:', err);
    }
  };

  useEffect(() => {
    handleFilterJobs();
  }, [searchQuery, companyFilter, locationFilter, typeFilter, experienceFilter]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.updateCandidateProfile(profileForm);
      setProfileMsg('Profile updated successfully!');
      loadAllData();
    } catch (err: any) {
      setProfileMsg('Failed to update profile: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0c111d] border-r border-slate-800 shrink-0 p-4 flex flex-col justify-between">
        <div>
          {/* Candidate Profile Widget */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold flex items-center justify-center shrink-0">
              {candidate?.name?.charAt(0) || 'C'}
            </div>
            <div className="truncate">
              <div className="font-semibold text-sm text-white truncate">{candidate?.name}</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{candidate?.candidate_id}</div>
            </div>
          </div>

          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-3 mb-2">
            Navigation
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('find-jobs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'find-jobs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Find Jobs</span>
              <span className="ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'applications'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>My Applications</span>
              <span className="ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'resumes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Resume & Parsing</span>
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'interviews'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Interviews</span>
              {interviews.filter((i) => i.status === 'Scheduled').length > 0 && (
                <span className="ml-auto font-mono text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                  {interviews.filter((i) => i.status === 'Scheduled').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notifications</span>
              {notifications.filter((n) => !n.read_status).length > 0 && (
                <span className="ml-auto font-mono text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read_status).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Footer logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Candidate Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor profile completion, browse active requisitions, and track screening fit scores.
              </p>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Profile Completion</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  {dashboardData?.stats?.profile_completion || 75}%
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${dashboardData?.stats?.profile_completion || 75}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Available Jobs</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {dashboardData?.stats?.available_jobs || jobs.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Across partner IT firms</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Jobs Applied</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {dashboardData?.stats?.jobs_applied || applications.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Applications sent</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">In Progress</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {dashboardData?.stats?.applications_in_progress || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Under HR review</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Shortlisted</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {dashboardData?.stats?.shortlisted_applications || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Qualified candidates</div>
              </div>
            </div>

            {/* Quick Actions & Recent Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Applications List */}
              <div className="lg:col-span-2 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Applications</h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    View All ({applications.length})
                  </button>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-2.5">
                    {applications.slice(0, 4).map((app) => (
                      <div
                        key={app.application_id}
                        className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{app.job_title}</div>
                          <div className="text-[11px] text-slate-400">
                            {app.company_name} · Applied on {app.applied_at}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">
                              {app.fit_score}% Fit
                            </div>
                            <div className="text-[10px] text-emerald-400 font-medium">
                              {app.eligibility_status}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-[11px] font-medium">
                            {app.application_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    You haven't applied to any roles yet.{' '}
                    <button
                      onClick={() => setActiveTab('find-jobs')}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Browse Jobs
                    </button>
                  </div>
                )}
              </div>

              {/* Next Steps / Profile Summary Card */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Screening Readiness
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Upload your latest resume to get instant keyword match percentages before applying.
                  </p>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs space-y-1.5">
                    <div className="text-slate-400">Target Role: <strong className="text-slate-200">{candidate?.preferred_role}</strong></div>
                    <div className="text-slate-400">Experience: <strong className="text-slate-200">{candidate?.experience_years} years</strong></div>
                    <div className="text-slate-400">Education: <strong className="text-slate-200">{candidate?.education}</strong></div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('find-jobs')}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explore Open Jobs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIND JOBS */}
        {activeTab === 'find-jobs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Browse Open Jobs</h1>
              <p className="text-xs text-slate-400 mt-1">
                Filter enterprise tech roles, inspect required qualifications, and run live resume fit scoring.
              </p>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title, skill keywords (e.g. Python, React, Cloud)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Company</label>
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Companies</option>
                    <option value="INF001">Infosys</option>
                    <option value="TCS001">TCS</option>
                    <option value="WIP001">Wipro</option>
                    <option value="ACC001">Accenture</option>
                    <option value="HCL001">HCLTech</option>
                    <option value="TM001">Tech Mahindra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Employment Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Max Experience</label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="All">Any Experience</option>
                    <option value="1">Entry Level (≤ 1 yr)</option>
                    <option value="2">Junior (≤ 2 yrs)</option>
                    <option value="4">Mid-Senior (≤ 4 yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Locations</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Noida">Noida</option>
                  </select>
                </div>
              </div>
            </div>

            {/* JOBS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const isApplied = applications.some((a) => a.job_id === job.job_id);

                return (
                  <div
                    key={job.job_id}
                    className="p-5 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                            {job.company_name}
                          </span>
                          <h3 className="text-base font-bold text-white leading-snug">{job.title}</h3>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded whitespace-nowrap">
                          {job.employment_type}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mb-3 flex items-center gap-3">
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{job.experience_requirement} yr(s) exp</span>
                        {job.salary_range && (
                          <>
                            <span>·</span>
                            <span className="text-slate-300">{job.salary_range}</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="mb-4">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                          Required Skills:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map((s) => (
                            <span
                              key={s}
                              className="text-[11px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Deadline: {job.deadline}</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedJobDetails(job)}
                          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
                        >
                          View Details
                        </button>

                        {isApplied ? (
                          <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Applied
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedJobForScreening(job)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <span>Screen & Apply</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active jobs found matching the selected filters.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Applications</h1>
              <p className="text-xs text-slate-400 mt-1">
                Track your active job submissions, calculated fit scores, and interview progressions.
              </p>
            </div>

            {applications.length > 0 ? (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Job Title & Company</th>
                        <th className="py-3 px-4">Fit Score</th>
                        <th className="py-3 px-4">Eligibility</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Applied Date</th>
                        <th className="py-3 px-4">Resume Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {applications.map((app) => (
                        <tr key={app.application_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{app.job_title}</div>
                            <div className="text-[11px] text-slate-400">{app.company_name}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">
                            {app.fit_score}%
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                app.eligibility_status === 'Eligible'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              }`}
                            >
                              {app.eligibility_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 bg-slate-800 rounded text-slate-200 font-medium text-[11px]">
                              {app.application_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {app.applied_at}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 truncate max-w-[150px]">
                            {app.resume_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No submitted applications found.{' '}
                <button
                  onClick={() => setActiveTab('find-jobs')}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Start exploring open roles
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RESUME & PARSING */}
        {activeTab === 'resumes' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Resume & Ingested Skills</h1>
              <p className="text-xs text-slate-400 mt-1">
                Verify parsed technical keywords, educational credentials, and experience profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resumes List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Stored Resumes</h3>
                {resumes.map((r) => (
                  <div key={r.resume_id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">{r.file_name}</div>
                          <div className="text-[11px] text-slate-400">Uploaded on {r.upload_date}</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {r.parsed_experience_years} yrs exp
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                          Extracted Skills:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.parsed_skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
                          Education:
                        </div>
                        <div className="text-slate-200">{r.parsed_education}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Resume Directly */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Upload / Update Primary Resume</h3>
                <p className="text-xs text-slate-400">
                  When you screen for a job, you can also upload or paste your resume dynamically.
                </p>
                <button
                  onClick={() => setActiveTab('find-jobs')}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Choose Job to Screen With</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCHEDULED INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Scheduled Interviews</h1>
              <p className="text-xs text-slate-400 mt-1">
                Review technical rounds, interview times, Google Meet URLs, and recruiter instructions.
              </p>
            </div>

            {interviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((int) => (
                  <div
                    key={int.interview_id}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-indigo-400 font-semibold">{int.company_name}</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-semibold">
                          {int.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{int.job_title}</h3>

                      <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4">
                        <div><strong>Date:</strong> {int.interview_date}</div>
                        <div><strong>Time:</strong> {int.interview_time}</div>
                        <div><strong>Type:</strong> {int.interview_type}</div>
                        {int.notes && <div><strong>Notes:</strong> {int.notes}</div>}
                      </div>
                    </div>

                    <a
                      href={int.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Join Meeting Link</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No interviews scheduled yet. Once an HR recruiter reviews and shortlists your application, your meeting schedule will appear here.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time alerts regarding application progress and interviews.</p>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.notification_id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                    n.read_status
                      ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                      : 'bg-slate-900 border-indigo-500/40 text-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-medium">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{n.created_at}</div>
                    </div>
                  </div>

                  {!n.read_status && (
                    <button
                      onClick={async () => {
                        await api.markNotificationRead(n.notification_id);
                        loadAllData();
                      }}
                      className="text-[11px] text-indigo-400 hover:underline shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h1>
              <p className="text-xs text-slate-400 mt-1">Keep your contact and skill information updated for recruiters.</p>
            </div>

            {profileMsg && (
              <div className="p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-indigo-300 text-xs">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={profileForm.email || ''}
                    className="w-full p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={profileForm.education || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profileForm.experience_years ?? 0}
                    onChange={(e) => setProfileForm({ ...profileForm, experience_years: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(profileForm.skills) ? profileForm.skills.join(', ') : profileForm.skills || ''}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* JOB DETAIL VIEW MODAL */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-indigo-400 font-semibold">{selectedJobDetails.company_name}</div>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedJobDetails.title}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedJobDetails.location} · {selectedJobDetails.employment_type} · Exp: {selectedJobDetails.experience_requirement} yr(s)
                </div>
              </div>
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs space-y-3">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Description</h4>
                <p className="text-slate-400 leading-relaxed">{selectedJobDetails.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobDetails.required_skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-indigo-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Education Requirements</h4>
                <p className="text-slate-400">{selectedJobDetails.education_requirement}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedJobForScreening(selectedJobDetails);
                  setSelectedJobDetails(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5"
              >
                <span>Screen Resume & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUME SCREENING & APPLICATION MODAL */}
      {selectedJobForScreening && (
        <ResumeScreeningModal
          job={selectedJobForScreening}
          isOpen={true}
          onClose={() => setSelectedJobForScreening(null)}
          onApplicationSubmitted={() => {
            loadAllData();
            setActiveTab('applications');
          }}
        />
      )}
    </div>
  );
};
