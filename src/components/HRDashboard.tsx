import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, Company, HRUser, Interview, Job, ScreeningResult, ScreeningWeights } from '../types/index';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Cpu,
  BarChart3,
  Calendar,
  Settings,
  Building2,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Sliders,
  X,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  FileText
} from 'lucide-react';

export const HRDashboard: React.FC = () => {
  const { user, company, logout } = useAuth();
  const hrUser = user as HRUser;

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'jobs' | 'applicants' | 'screening' | 'ranking' | 'interviews' | 'weights' | 'reports' | 'company'
  >('dashboard');

  // HR Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [rankingsData, setRankingsData] = useState<any>(null);
  const [selectedRankingJobId, setSelectedRankingJobId] = useState<string>('');
  const [reportsData, setReportsData] = useState<any>(null);
  const [companyWeights, setCompanyWeights] = useState<ScreeningWeights>({
    skills_weight: 50,
    education_weight: 20,
    experience_weight: 20,
    projects_weight: 10,
    min_passing_score: 70
  });

  const [loading, setLoading] = useState(true);

  // Filters for Applicants
  const [applicantSearch, setApplicantSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minFitScoreFilter, setMinFitScoreFilter] = useState(0);

  // Modals state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    education_requirement: 'B.Tech / B.E / MCA in Computer Science',
    experience_requirement: 2,
    location: company?.location || 'Bengaluru, India',
    employment_type: 'Full-time' as Job['employment_type'],
    salary_range: '₹8,00,000 - ₹14,00,000 PA',
    deadline: '2026-11-30'
  });

  // Screening detail modal
  const [selectedScreeningData, setSelectedScreeningData] = useState<any>(null);

  // Schedule interview modal
  const [interviewModalApp, setInterviewModalApp] = useState<Application | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    interview_time: '14:00 IST',
    interview_type: 'Technical',
    notes: 'Please prepare live coding in your preferred core stack.',
    meeting_link: 'https://meet.google.com/recruitment-session'
  });

  // Weights save feedback
  const [weightsMsg, setWeightsMsg] = useState<string | null>(null);

  // Fetch all company-isolated data
  const loadHRData = async () => {
    try {
      setLoading(true);
      const [dashRes, jobsRes, appsRes, intsRes, weightsRes, reportsRes] = await Promise.all([
        api.getHRDashboard(),
        api.getHRJobs(),
        api.getHRApplicants(),
        api.getHRInterviews(),
        api.getScreeningWeights(),
        api.getHRReports()
      ]);

      setDashboardData(dashRes);
      setJobs(jobsRes.jobs);
      setApplicants(appsRes.applicants);
      setInterviews(intsRes.interviews);
      setCompanyWeights(weightsRes.weights);
      setReportsData(reportsRes);

      if (jobsRes.jobs.length > 0) {
        setSelectedRankingJobId(jobsRes.jobs[0].job_id);
        const rankRes = await api.getHRRankings(jobsRes.jobs[0].job_id);
        setRankingsData(rankRes);
      }
    } catch (err) {
      console.error('Failed to load HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, [hrUser.company_id]);

  // Applicants filter handler
  const handleFilterApplicants = async () => {
    try {
      const res = await api.getHRApplicants({
        search: applicantSearch,
        job_id: jobFilter,
        eligibility: eligibilityFilter,
        status: statusFilter,
        fit_score_min: minFitScoreFilter > 0 ? minFitScoreFilter : undefined
      });
      setApplicants(res.applicants);
    } catch (err) {
      console.error('Filter applicants failed:', err);
    }
  };

  useEffect(() => {
    handleFilterApplicants();
  }, [applicantSearch, jobFilter, eligibilityFilter, statusFilter, minFitScoreFilter]);

  // Handle ranking change by job
  const handleRankingJobChange = async (jobId: string) => {
    setSelectedRankingJobId(jobId);
    try {
      const rankRes = await api.getHRRankings(jobId);
      setRankingsData(rankRes);
    } catch (err) {
      console.error('Failed to fetch rankings for job:', err);
    }
  };

  // Job create/edit submit
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.updateHRJob(editingJob.job_id, {
          title: jobForm.title,
          description: jobForm.description,
          required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
          education_requirement: jobForm.education_requirement,
          experience_requirement: Number(jobForm.experience_requirement),
          location: jobForm.location,
          employment_type: jobForm.employment_type,
          salary_range: jobForm.salary_range,
          deadline: jobForm.deadline
        });
      } else {
        await api.createHRJob({
          title: jobForm.title,
          description: jobForm.description,
          required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
          education_requirement: jobForm.education_requirement,
          experience_requirement: Number(jobForm.experience_requirement),
          location: jobForm.location,
          employment_type: jobForm.employment_type,
          salary_range: jobForm.salary_range,
          deadline: jobForm.deadline
        });
      }
      setShowJobModal(false);
      setEditingJob(null);
      loadHRData();
    } catch (err: any) {
      alert('Error saving job: ' + err.message);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to close/delete this job?')) return;
    try {
      await api.deleteHRJob(jobId);
      loadHRData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Update applicant status (Shortlist, Reject, etc.)
  const handleUpdateStatus = async (appId: string, newStatus: Application['application_status']) => {
    try {
      await api.updateApplicantStatus(appId, newStatus);
      loadHRData();
      if (selectedScreeningData && selectedScreeningData.application.application_id === appId) {
        setSelectedScreeningData({
          ...selectedScreeningData,
          application: { ...selectedScreeningData.application, application_status: newStatus }
        });
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // View Candidate Screening Result
  const handleOpenScreening = async (appId: string) => {
    try {
      const data = await api.getApplicantScreening(appId);
      setSelectedScreeningData(data);
    } catch (err: any) {
      alert('Error fetching screening: ' + err.message);
    }
  };

  // Schedule Interview submit
  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalApp) return;

    try {
      await api.scheduleInterview({
        application_id: interviewModalApp.application_id,
        interview_date: interviewForm.interview_date,
        interview_time: interviewForm.interview_time,
        interview_type: interviewForm.interview_type,
        notes: interviewForm.notes,
        meeting_link: interviewForm.meeting_link
      });
      setInterviewModalApp(null);
      loadHRData();
      alert('Interview scheduled successfully! Notification sent to candidate.');
    } catch (err: any) {
      alert('Error scheduling interview: ' + err.message);
    }
  };

  // Save Screening Weights
  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightsMsg(null);
    try {
      await api.updateScreeningWeights(companyWeights);
      setWeightsMsg('Company screening weights saved successfully!');
    } catch (err: any) {
      setWeightsMsg('Error saving weights: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0c111d] border-r border-slate-800 shrink-0 p-4 flex flex-col justify-between">
        <div>
          {/* Company Badge Widget */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-indigo-400 font-bold">{company?.company_id}</span>
            </div>
            <div className="font-bold text-white text-sm truncate">{company?.company_name}</div>
            <div className="text-[11px] text-slate-400 truncate">{hrUser.name} · Recruiter</div>
          </div>

          {/* Strict Isolation Notice */}
          <div className="px-3 py-2 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-[10px] text-indigo-300 mb-5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Strict Company Data Isolation Active</span>
          </div>

          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-3 mb-2">
            HR Navigation
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
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Job Requisitions</span>
              <span className="ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applicants')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'applicants'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Applicants</span>
              <span className="ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {applicants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'ranking'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Candidate Pre-Ranking</span>
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
              <span className="ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {interviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('weights')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'weights'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Screening Weights</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Analytics & Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('company')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'company'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Company Profile</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({company?.company_name})</span>
          </button>
        </div>
      </aside>

      {/* MAIN HR VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Dynamic Multi-Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome, {company?.company_name} HR
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-semibold">
                {company?.company_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recruitment management portal for {company?.company_name}. Data isolated under tenant {company?.company_id}.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingJob(null);
              setJobForm({
                title: '',
                description: '',
                required_skills: '',
                education_requirement: 'B.Tech / B.E / MCA in Computer Science',
                experience_requirement: 2,
                location: company?.location || 'Bengaluru, India',
                employment_type: 'Full-time',
                salary_range: '₹8,00,000 - ₹14,00,000 PA',
                deadline: '2026-11-30'
              });
              setShowJobModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Requisition</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 6 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Total Jobs</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {dashboardData?.stats?.total_jobs || jobs.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">All posted roles</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Active Jobs</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  {dashboardData?.stats?.active_jobs || jobs.filter((j) => j.status === 'Active').length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Open for applicants</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Total Applicants</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {dashboardData?.stats?.total_applicants || applicants.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Received resumes</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Eligible Candidates</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {dashboardData?.stats?.eligible_candidates || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Passed threshold</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Shortlisted</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {dashboardData?.stats?.shortlisted_candidates || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Ready for interview</div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Interviews</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {dashboardData?.stats?.interviews_scheduled || interviews.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Scheduled rounds</div>
              </div>
            </div>

            {/* Recent Applicants & Active Requisitions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Applicants */}
              <div className="lg:col-span-2 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Applicants for {company?.company_name}</h3>
                  <button onClick={() => setActiveTab('applicants')} className="text-xs text-indigo-400 hover:underline">
                    View Table
                  </button>
                </div>

                {applicants.length > 0 ? (
                  <div className="space-y-2.5">
                    {applicants.slice(0, 5).map((app) => (
                      <div
                        key={app.application_id}
                        className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{app.candidate_name}</div>
                          <div className="text-[11px] text-slate-400">
                            Applied for: {app.job_title} · {app.applied_at}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">{app.fit_score}% Fit</div>
                            <div className="text-[10px] text-emerald-400 font-medium">{app.eligibility_status}</div>
                          </div>
                          <button
                            onClick={() => handleOpenScreening(app.application_id)}
                            className="px-2.5 py-1 text-xs text-indigo-300 hover:text-white bg-slate-800 rounded transition-colors"
                          >
                            Screening
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No applicants received yet for {company?.company_name}.
                  </div>
                )}
              </div>

              {/* Active Requisitions Quick List */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Active Requisitions</h3>
                  <button onClick={() => setActiveTab('jobs')} className="text-xs text-indigo-400 hover:underline">
                    Manage
                  </button>
                </div>

                <div className="space-y-2">
                  {jobs.slice(0, 4).map((j) => (
                    <div key={j.job_id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <div className="font-semibold text-white truncate">{j.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {j.employment_type} · Deadline {j.deadline}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Job Requisitions ({company?.company_name})</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create, edit, or close job openings restricted to {company?.company_name}.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingJob(null);
                  setJobForm({
                    title: '',
                    description: '',
                    required_skills: '',
                    education_requirement: 'B.Tech / B.E / MCA in Computer Science',
                    experience_requirement: 2,
                    location: company?.location || 'Bengaluru, India',
                    employment_type: 'Full-time',
                    salary_range: '₹8,00,000 - ₹14,00,000 PA',
                    deadline: '2026-11-30'
                  });
                  setShowJobModal(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Job</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.job_id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-indigo-400 font-semibold">{job.job_id}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          job.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{job.title}</h3>
                    <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job.employment_type}</span>
                      <span>·</span>
                      <span>{job.experience_requirement} yr(s) exp</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

                    <div className="mb-4">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Skills Required:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[11px]">
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
                        onClick={() => {
                          setEditingJob(job);
                          setJobForm({
                            title: job.title,
                            description: job.description,
                            required_skills: job.required_skills.join(', '),
                            education_requirement: job.education_requirement,
                            experience_requirement: job.experience_requirement,
                            location: job.location,
                            employment_type: job.employment_type,
                            salary_range: job.salary_range || '',
                            deadline: job.deadline
                          });
                          setShowJobModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.job_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANTS MANAGEMENT */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Candidate Applications ({company?.company_name})</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review applicant fit scores, inspect resume screening details, and take action.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, candidate ID, role..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Filter by Job</label>
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="All">All Jobs</option>
                    {jobs.map((j) => (
                      <option key={j.job_id} value={j.job_id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Eligibility Status</label>
                  <select
                    value={eligibilityFilter}
                    onChange={(e) => setEligibilityFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="All">All</option>
                    <option value="Eligible">Eligible (≥70%)</option>
                    <option value="Review Needed">Review Needed</option>
                    <option value="Not Eligible">Not Eligible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Application Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Min Fit Score: {minFitScoreFilter}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="10"
                    value={minFitScoreFilter}
                    onChange={(e) => setMinFitScoreFilter(Number(e.target.value))}
                    className="w-full mt-2 accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Role Applied</th>
                      <th className="py-3 px-4">Fit Score</th>
                      <th className="py-3 px-4">Eligibility</th>
                      <th className="py-3 px-4">Skills & Exp</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {applicants.map((app) => (
                      <tr key={app.application_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{app.candidate_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{app.candidate_id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {app.job_title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-sm font-bold text-white tabular-nums">
                            {app.fit_score}%
                          </span>
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
                        <td className="py-3.5 px-4 max-w-[180px]">
                          <div className="truncate text-slate-300">{app.candidate_skills?.slice(0, 3).join(', ')}</div>
                          <div className="text-[11px] text-slate-400">{app.candidate_experience} yrs exp</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px] font-medium">
                            {app.application_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenScreening(app.application_id)}
                            className="px-2.5 py-1 text-xs text-indigo-300 hover:text-white bg-slate-800 rounded transition-colors"
                          >
                            Screening
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.application_id, 'Shortlisted')}
                            className="px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors"
                            title="Shortlist"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => {
                              setInterviewModalApp(app);
                            }}
                            className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors"
                          >
                            Interview
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                            className="px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                            title="Reject"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {applicants.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No applicants match the current filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CANDIDATE PRE-RANKING (LEADERBOARD) */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Candidate Pre-Ranking Engine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated pre-ranking aid based on candidate resume fit score and required skills match.
                </p>
              </div>

              {/* Select Job */}
              <div className="w-full sm:w-64">
                <label className="block text-[10px] text-slate-400 mb-1">Select Requisition:</label>
                <select
                  value={selectedRankingJobId}
                  onChange={(e) => handleRankingJobChange(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                >
                  {jobs.map((j) => (
                    <option key={j.job_id} value={j.job_id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Note:</strong> Automated screening aid only. Final hiring and interview decisions remain with the HR recruiter.
              </span>
            </div>

            {/* Ranking Table */}
            {rankingsData?.rankings?.length > 0 ? (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Fit Score</th>
                      <th className="py-3 px-4">Skills Match</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Eligibility</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {rankingsData.rankings.map((r: any) => (
                      <tr key={r.application_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 text-sm">
                          #{r.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{r.candidate_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.candidate_id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm tabular-nums">
                          {r.fit_score}%
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {r.skills_match}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {r.experience}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              r.eligibility_status === 'Eligible'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {r.eligibility_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">
                            {r.application_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenScreening(r.application_id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No candidate applications received yet for this requisition.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INTERVIEW MANAGEMENT */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Interview Schedules ({company?.company_name})</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage upcoming candidate interview rounds and update evaluation statuses.
              </p>
            </div>

            {interviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((int) => (
                  <div key={int.interview_id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-indigo-400 font-semibold">{int.interview_id}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                          int.status === 'Scheduled'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {int.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{int.candidate_name}</h3>
                      <div className="text-xs text-slate-400">{int.job_title}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 text-xs text-slate-300">
                      <div><strong>Date:</strong> {int.interview_date} at {int.interview_time}</div>
                      <div><strong>Round:</strong> {int.interview_type}</div>
                      {int.notes && <div><strong>Notes:</strong> {int.notes}</div>}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <a
                        href={int.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Meeting Link
                      </a>

                      <select
                        value={int.status}
                        onChange={async (e) => {
                          await api.updateInterviewStatus(int.interview_id, e.target.value as any);
                          loadHRData();
                        }}
                        className="p-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No interviews scheduled yet. Select a shortlisted candidate from the Applicants tab to coordinate an interview.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SCREENING WEIGHTS CONFIGURATION */}
        {activeTab === 'weights' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Configurable Fit-Score Weights
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize the transparent rule-based algorithm weights for {company?.company_name}.
              </p>
            </div>

            {weightsMsg && (
              <div className="p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-indigo-300 text-xs">
                {weightsMsg}
              </div>
            )}

            <form onSubmit={handleSaveWeights} className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1">
                  <span>Skills Match Weight</span>
                  <span className="font-mono text-indigo-400">{companyWeights.skills_weight}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={companyWeights.skills_weight}
                  onChange={(e) =>
                    setCompanyWeights({ ...companyWeights, skills_weight: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1">
                  <span>Education Qualification Weight</span>
                  <span className="font-mono text-cyan-400">{companyWeights.education_weight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={companyWeights.education_weight}
                  onChange={(e) =>
                    setCompanyWeights({ ...companyWeights, education_weight: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1">
                  <span>Experience Alignment Weight</span>
                  <span className="font-mono text-emerald-400">{companyWeights.experience_weight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={companyWeights.experience_weight}
                  onChange={(e) =>
                    setCompanyWeights({ ...companyWeights, experience_weight: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1">
                  <span>Projects & Certifications Weight</span>
                  <span className="font-mono text-amber-400">{companyWeights.projects_weight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={companyWeights.projects_weight}
                  onChange={(e) =>
                    setCompanyWeights({ ...companyWeights, projects_weight: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between font-semibold text-slate-200 mb-1">
                  <span>Minimum Passing Score for 'Eligible' Status</span>
                  <span className="font-mono text-white">{companyWeights.min_passing_score}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="85"
                  step="5"
                  value={companyWeights.min_passing_score}
                  onChange={(e) =>
                    setCompanyWeights({ ...companyWeights, min_passing_score: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                >
                  Save Screening Weights
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Recruitment Reports & Analytics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time metrics on candidate fit score distribution and application velocity for {company?.company_name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">Fit Score Distribution</h3>
                <div className="space-y-3 text-xs">
                  {reportsData?.score_distribution &&
                    Object.entries(reportsData.score_distribution).map(([range, count]) => (
                      <div key={range}>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>{range}</span>
                          <span className="font-mono text-white">{count as number} candidates</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${
                                reportsData.total_applicants > 0
                                  ? ((count as number) / reportsData.total_applicants) * 100
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Status Pipeline Funnel */}
              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">Application Pipeline Funnel</h3>
                <div className="space-y-2.5 text-xs">
                  {reportsData?.status_counts &&
                    Object.entries(reportsData.status_counts).map(([status, count]) => (
                      <div
                        key={status}
                        className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-200">{status}</span>
                        <span className="font-mono font-bold text-indigo-400">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: COMPANY PROFILE */}
        {activeTab === 'company' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-white">Company Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise details associated with Company ID: {company?.company_id}
              </p>
            </div>

            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl text-xs space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    disabled
                    value={company?.company_name || ''}
                    className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company ID</label>
                  <input
                    type="text"
                    disabled
                    value={company?.company_id || ''}
                    className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Industry</label>
                <input
                  type="text"
                  disabled
                  value={company?.industry || ''}
                  className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  disabled
                  value={company?.location || ''}
                  className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  disabled
                  rows={3}
                  value={company?.description || ''}
                  className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingJob ? 'Edit Requisition' : `Create Job for ${company?.company_name}`}
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Cloud Solutions Architect"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Job Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe core responsibilities and team objectives..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Required Skill Keywords (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, Java, SQL, React, AWS, Docker"
                  value={jobForm.required_skills}
                  onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Education Requirement</label>
                  <input
                    type="text"
                    value={jobForm.education_requirement}
                    onChange={(e) => setJobForm({ ...jobForm, education_requirement: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={jobForm.experience_requirement}
                    onChange={(e) => setJobForm({ ...jobForm, experience_requirement: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Employment Type</label>
                  <select
                    value={jobForm.employment_type}
                    onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {editingJob ? 'Update Job' : 'Post Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE SCREENING DETAIL MODAL */}
      {selectedScreeningData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                  {selectedScreeningData.application.company_name} · Screening Result
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedScreeningData.candidate?.name} - {selectedScreeningData.job?.title}
                </h3>
              </div>
              <button onClick={() => setSelectedScreeningData(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Fit Score & Eligibility
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                    {selectedScreeningData.screening?.fit_score ?? selectedScreeningData.application.fit_score}%
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                      selectedScreeningData.application.eligibility_status === 'Eligible'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {selectedScreeningData.application.eligibility_status}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 space-y-1">
                <div>Candidate: <strong className="text-slate-200">{selectedScreeningData.candidate?.name}</strong></div>
                <div>ID: <strong className="text-slate-200 font-mono">{selectedScreeningData.candidate?.candidate_id}</strong></div>
                <div>Status: <strong className="text-indigo-400">{selectedScreeningData.application.application_status}</strong></div>
              </div>
            </div>

            {/* Matching vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                  Matching Skills ({selectedScreeningData.screening?.matching_skills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedScreeningData.screening?.matching_skills?.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/50 rounded text-emerald-300">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-2">
                  Missing Skills ({selectedScreeningData.screening?.missing_skills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedScreeningData.screening?.missing_skills?.length > 0 ? (
                    selectedScreeningData.screening?.missing_skills?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                        • {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-400">All required skills present!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insights & Interview Questions */}
            {selectedScreeningData.screening?.ai_analysis && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-xs space-y-2">
                <div className="text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Keyword & Candidate Evaluation
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedScreeningData.screening.ai_analysis.keyword_match_summary}
                </p>
                {selectedScreeningData.screening.ai_analysis.suggested_interview_questions?.length > 0 && (
                  <div className="pt-2 border-t border-indigo-900/30">
                    <div className="font-semibold text-indigo-300 mb-1">Tailored Technical Interview Questions:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {selectedScreeningData.screening.ai_analysis.suggested_interview_questions.map((q: string, idx: number) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedScreeningData.application.application_id, 'Shortlisted');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => {
                    setInterviewModalApp(selectedScreeningData.application);
                    setSelectedScreeningData(null);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedScreeningData.application.application_id, 'Rejected');
                  }}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold"
                >
                  Reject
                </button>
              </div>

              <button
                onClick={() => setSelectedScreeningData(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Schedule Interview</h3>
                <div className="text-xs text-slate-400">
                  {interviewModalApp.candidate_name} · {interviewModalApp.job_title}
                </div>
              </div>
              <button onClick={() => setInterviewModalApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.interview_date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14:30 IST"
                    value={interviewForm.interview_time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_time: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Interview Type</label>
                <select
                  value={interviewForm.interview_type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_type: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Technical">Technical Round</option>
                  <option value="HR Round">HR Round</option>
                  <option value="Managerial">Managerial Round</option>
                  <option value="Cultural Fit">Cultural Fit Round</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Google Meet / Video Link</label>
                <input
                  type="url"
                  value={interviewForm.meeting_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalApp(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
