import {
  Application,
  Candidate,
  Company,
  HRUser,
  Interview,
  Job,
  Notification,
  Resume,
  ScreeningResult,
  ScreeningWeights
} from '../types/index';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('hirescreen_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

export const api = {
  // Demo Data
  getDemoCompanies: () => request<{ companies: any[] }>('/companies/demo'),
  getDemoCandidates: () => request<{ candidates: any[] }>('/candidates/demo'),

  // Auth
  candidateLogin: (identifier: string, password: string) =>
    request<{ token: string; user: Candidate; role: 'candidate' }>('/auth/candidate/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }),

  candidateRegister: (payload: any) =>
    request<{ token: string; user: Candidate; role: 'candidate' }>('/auth/candidate/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  hrLogin: (company_id: string, email: string, password: string) =>
    request<{ token: string; user: HRUser; company: Company; role: 'hr' }>('/auth/hr/login', {
      method: 'POST',
      body: JSON.stringify({ company_id, email, password })
    }),

  getCurrentUser: () => request<{ role: 'candidate' | 'hr'; user: any; company?: Company }>('/auth/me'),

  // Public Jobs & Companies
  getJobs: (filters: {
    query?: string;
    company?: string;
    location?: string;
    employment_type?: string;
    experience?: string;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.company && filters.company !== 'All') params.append('company', filters.company);
    if (filters.location && filters.location !== 'All') params.append('location', filters.location);
    if (filters.employment_type && filters.employment_type !== 'All') params.append('employment_type', filters.employment_type);
    if (filters.experience && filters.experience !== 'All') params.append('experience', filters.experience);
    return request<{ jobs: Job[] }>(`/jobs?${params.toString()}`);
  },

  getJobById: (id: string) => request<{ job: Job; company: Company }>(`/jobs/${id}`),
  getCompanies: () => request<{ companies: Company[] }>('/companies'),

  // Candidate APIs
  getCandidateDashboard: () =>
    request<{
      candidate: Candidate;
      stats: {
        profile_completion: number;
        available_jobs: number;
        jobs_applied: number;
        applications_in_progress: number;
        shortlisted_applications: number;
        interviews_scheduled: number;
      };
      recent_applications: Application[];
      upcoming_interviews: Interview[];
    }>('/candidate/dashboard'),

  getCandidateProfile: () => request<{ candidate: Candidate }>('/candidate/profile'),
  updateCandidateProfile: (updates: Partial<Candidate>) =>
    request<{ candidate: Candidate }>('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  getCandidateResumes: () => request<{ resumes: Resume[] }>('/candidate/resumes'),
  uploadResume: (payload: {
    file_name: string;
    raw_text: string;
    parsed_skills?: string[];
    parsed_experience?: number;
    parsed_education?: string;
  }) =>
    request<{ message: string; resume: Resume }>('/candidate/resumes/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  screenResume: (payload: {
    job_id: string;
    resume_id?: string;
    resume_payload?: any;
  }) =>
    request<{
      message: string;
      screening: ScreeningResult;
      job: any;
    }>('/candidate/screen', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  applyForJob: (payload: {
    job_id: string;
    resume_id?: string;
    screening_data?: any;
  }) =>
    request<{
      message: string;
      application: Application;
      screening: ScreeningResult;
    }>('/candidate/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCandidateApplications: () => request<{ applications: Application[] }>('/candidate/applications'),
  getCandidateInterviews: () => request<{ interviews: Interview[] }>('/candidate/interviews'),
  getCandidateNotifications: () => request<{ notifications: Notification[] }>('/candidate/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/candidate/notifications/${id}/read`, { method: 'POST' }),

  // HR APIs (Strict Company Isolation)
  getHRDashboard: () =>
    request<{
      hr_user: HRUser;
      company: Company;
      stats: {
        total_jobs: number;
        active_jobs: number;
        total_applicants: number;
        eligible_candidates: number;
        shortlisted_candidates: number;
        interviews_scheduled: number;
      };
      recent_applicants: Application[];
      recent_jobs: Job[];
    }>('/hr/dashboard'),

  getHRJobs: () => request<{ jobs: Job[] }>('/hr/jobs'),
  createHRJob: (jobData: Partial<Job>) =>
    request<{ message: string; job: Job }>('/hr/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),

  updateHRJob: (id: string, updates: Partial<Job>) =>
    request<{ message: string; job: Job }>(`/hr/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteHRJob: (id: string) =>
    request<{ success: boolean; message: string }>(`/hr/jobs/${id}`, {
      method: 'DELETE'
    }),

  getHRApplicants: (params: {
    job_id?: string;
    fit_score_min?: number;
    eligibility?: string;
    status?: string;
    search?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.job_id && params.job_id !== 'All') qs.append('job_id', params.job_id);
    if (params.fit_score_min) qs.append('fit_score_min', String(params.fit_score_min));
    if (params.eligibility && params.eligibility !== 'All') qs.append('eligibility', params.eligibility);
    if (params.status && params.status !== 'All') qs.append('status', params.status);
    if (params.search) qs.append('search', params.search);
    return request<{ applicants: any[] }>(`/hr/applicants?${qs.toString()}`);
  },

  getApplicantScreening: (applicationId: string) =>
    request<{
      application: Application;
      screening: ScreeningResult;
      job: Job;
      candidate: Candidate;
      resume: Resume;
    }>(`/hr/applicants/${applicationId}/screening`),

  updateApplicantStatus: (applicationId: string, status: Application['application_status']) =>
    request<{ message: string; application: Application }>(`/hr/applicants/${applicationId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  getHRRankings: (job_id?: string) => {
    const qs = job_id ? `?job_id=${encodeURIComponent(job_id)}` : '';
    return request<{
      rankings: Array<{
        rank: number;
        application_id: string;
        candidate_id: string;
        candidate_name: string;
        fit_score: number;
        skills_match: string;
        experience: string;
        eligibility_status: string;
        application_status: string;
        matching_skills_count: number;
        applied_at: string;
      }>;
      jobs: Job[];
      selected_job?: Job;
    }>(`/hr/ranking${qs}`);
  },

  getHRInterviews: () => request<{ interviews: Interview[] }>('/hr/interviews'),
  scheduleInterview: (payload: {
    application_id: string;
    interview_date: string;
    interview_time: string;
    interview_type: string;
    notes?: string;
    meeting_link?: string;
  }) =>
    request<{ message: string; interview: Interview }>('/hr/interviews/schedule', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateInterviewStatus: (interviewId: string, status: Interview['status']) =>
    request<{ message: string; interview: Interview }>(`/hr/interviews/${interviewId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  getHRCompany: () => request<{ company: Company }>('/hr/company'),
  updateHRCompany: (updates: Partial<Company>) =>
    request<{ company: Company }>('/hr/company', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  getScreeningWeights: () => request<{ weights: ScreeningWeights }>('/hr/settings/weights'),
  updateScreeningWeights: (weights: ScreeningWeights) =>
    request<{ message: string; weights: ScreeningWeights }>('/hr/settings/weights', {
      method: 'PUT',
      body: JSON.stringify(weights)
    }),

  getHRReports: () =>
    request<{
      total_applicants: number;
      status_counts: Record<string, number>;
      score_distribution: Record<string, number>;
      job_breakdown: Array<{
        job_id: string;
        title: string;
        total_applicants: number;
        average_fit_score: number;
        shortlisted_count: number;
      }>;
    }>('/hr/reports')
};
