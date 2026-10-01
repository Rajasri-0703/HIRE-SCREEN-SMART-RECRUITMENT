import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { runScreeningEngine } from './screening';
import { Application, Candidate, HRUser, Interview, Job, Resume, ScreeningResult, ScreeningWeights } from '../src/types/index';

export const apiRouter = Router();

// Extend Request interface to hold authenticated user
export interface AuthenticatedRequest extends Request {
  userRole?: 'candidate' | 'hr';
  candidateUser?: Candidate;
  hrUser?: HRUser;
}

// Token helper for the prototype:
// "Bearer tok_cand_<candidate_id>" or "Bearer tok_hr_<hr_id>_<company_id>"
function parseAuthHeader(req: AuthenticatedRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return;
  const token = auth.replace('Bearer ', '').trim();

  if (token.startsWith('tok_cand_')) {
    const candId = token.replace('tok_cand_', '');
    const cand = db.getCandidateById(candId);
    if (cand) {
      req.userRole = 'candidate';
      req.candidateUser = cand;
    }
  } else if (token.startsWith('tok_hr_')) {
    const parts = token.replace('tok_hr_', '').split('_');
    const hrId = parts[0] + (parts[1] && parts[1].length < 5 ? '_' + parts[1] : '');
    // Or lookup by hr_id
    const hr = db.getHRUsers().find((u) => token.includes(u.hr_id));
    if (hr) {
      req.userRole = 'hr';
      req.hrUser = hr;
    }
  }
}

// Auth Middleware
export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  parseAuthHeader(req);
  next();
}

export function requireCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  parseAuthHeader(req);
  if (req.userRole !== 'candidate' || !req.candidateUser) {
    return res.status(401).json({ error: 'Candidate authentication required' });
  }
  next();
}

export function requireHR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  parseAuthHeader(req);
  if (req.userRole !== 'hr' || !req.hrUser) {
    return res.status(401).json({ error: 'HR authentication required' });
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION & DEMO ACCOUNTS
// ==========================================

// Demo HR & Candidate logins for quick college project evaluation
apiRouter.get('/companies/demo', (_req, res) => {
  const companies = db.getCompanies();
  const hrUsers = db.getHRUsers();
  const demoList = companies.map((c) => {
    const hr = hrUsers.find((h) => h.company_id === c.company_id);
    return {
      company_id: c.company_id,
      company_name: c.company_name,
      industry: c.industry,
      location: c.location,
      logo_color: c.logo_color,
      hr_name: hr?.name || 'Recruiter',
      hr_email: hr?.email || `hr@${c.company_name.toLowerCase()}.com`,
      demo_password: 'password123'
    };
  });
  res.json({ companies: demoList });
});

apiRouter.get('/candidates/demo', (_req, res) => {
  const candidates = db.getCandidates().slice(0, 4).map((c) => ({
    candidate_id: c.candidate_id,
    name: c.name,
    email: c.email,
    education: c.education,
    experience_years: c.experience_years,
    skills: c.skills,
    demo_password: 'password123'
  }));
  res.json({ candidates });
});

// Candidate Login
apiRouter.post('/auth/candidate/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Candidate ID/Email and password are required' });
  }

  const cand = db.getCandidates().find(
    (c) =>
      (c.email.toLowerCase() === identifier.toLowerCase() ||
        c.candidate_id.toLowerCase() === identifier.toLowerCase()) &&
      c.password === password
  );

  if (!cand) {
    return res.status(401).json({ error: 'Invalid candidate credentials' });
  }

  const token = `tok_cand_${cand.candidate_id}`;
  res.json({
    message: 'Candidate login successful',
    token,
    user: cand,
    role: 'candidate'
  });
});

// Candidate Registration
apiRouter.post('/auth/candidate/register', (req, res) => {
  const {
    name,
    candidate_id,
    email,
    phone,
    password,
    location,
    education,
    graduation_year,
    skills,
    experience_years,
    preferred_role,
    preferred_location
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check email conflict
  if (db.getCandidateByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newCandId = candidate_id?.trim() || 'CAN_' + Math.floor(100 + Math.random() * 900);

  const skillsArr = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
    ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const newCandidate: Candidate = {
    candidate_id: newCandId,
    name,
    email,
    phone: phone || '',
    password,
    location: location || '',
    education: education || 'Bachelor Degree',
    graduation_year: graduation_year || new Date().getFullYear().toString(),
    skills: skillsArr,
    experience_years: Number(experience_years) || 0,
    preferred_role: preferred_role || 'Software Engineer',
    preferred_location: preferred_location || 'Flexible',
    created_at: new Date().toISOString().split('T')[0]
  };

  db.createCandidate(newCandidate);

  // Initial welcome notification
  db.createNotification({
    notification_id: 'NOTIF_' + Date.now(),
    user_id: newCandidate.candidate_id,
    user_type: 'candidate',
    message: `Welcome to HireScreen, ${newCandidate.name}! Browse jobs and screen your resume to check your fit scores.`,
    created_at: new Date().toISOString().split('T')[0],
    read_status: false,
    type: 'status_update'
  });

  const token = `tok_cand_${newCandidate.candidate_id}`;
  res.status(201).json({
    message: 'Candidate registration successful',
    token,
    user: newCandidate,
    role: 'candidate'
  });
});

// HR Login with company_id enforcement
apiRouter.post('/auth/hr/login', (req, res) => {
  const { company_id, email, password } = req.body;
  if (!company_id || !email || !password) {
    return res.status(400).json({ error: 'Company ID, HR Email, and password are required' });
  }

  const hrUser = db.getHRUsers().find(
    (h) =>
      h.company_id.toUpperCase() === company_id.toUpperCase() &&
      h.email.toLowerCase() === email.toLowerCase() &&
      h.password === password
  );

  if (!hrUser) {
    return res.status(401).json({ error: 'Invalid Company ID, Email, or Password' });
  }

  const company = db.getCompany(hrUser.company_id);
  const token = `tok_hr_${hrUser.hr_id}_${hrUser.company_id}`;

  res.json({
    message: 'HR login successful',
    token,
    user: {
      ...hrUser,
      company_name: company?.company_name || 'Enterprise'
    },
    company,
    role: 'hr'
  });
});

// Current User Info
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res) => {
  parseAuthHeader(req);
  if (req.userRole === 'candidate' && req.candidateUser) {
    return res.json({
      role: 'candidate',
      user: req.candidateUser
    });
  } else if (req.userRole === 'hr' && req.hrUser) {
    const company = db.getCompany(req.hrUser.company_id);
    return res.json({
      role: 'hr',
      user: {
        ...req.hrUser,
        company_name: company?.company_name
      },
      company
    });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// ==========================================
// 2. PUBLIC JOBS & COMPANIES
// ==========================================

apiRouter.get('/jobs', (req, res) => {
  const { query, company, location, employment_type, experience } = req.query;
  let jobs = db.getAllActiveJobs();

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.required_skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (company && typeof company === 'string' && company !== 'All') {
    jobs = jobs.filter(
      (j) => j.company_id === company || j.company_name.toLowerCase().includes(company.toLowerCase())
    );
  }

  if (location && typeof location === 'string' && location !== 'All') {
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (employment_type && typeof employment_type === 'string' && employment_type !== 'All') {
    jobs = jobs.filter((j) => j.employment_type === employment_type);
  }

  if (experience && typeof experience === 'string' && experience !== 'All') {
    const expNum = parseInt(experience, 10);
    if (!isNaN(expNum)) {
      jobs = jobs.filter((j) => j.experience_requirement <= expNum);
    }
  }

  res.json({ jobs });
});

apiRouter.get('/jobs/:id', (req, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const company = db.getCompany(job.company_id);
  res.json({ job, company });
});

apiRouter.get('/companies', (_req, res) => {
  const companies = db.getCompanies();
  res.json({ companies });
});

// ==========================================
// 3. CANDIDATE DASHBOARD & RESUME SCREENING
// ==========================================

apiRouter.get('/candidate/dashboard', requireCandidate, (req: AuthenticatedRequest, res) => {
  const candidate = req.candidateUser!;
  const applications = db.getApplicationsByCandidate(candidate.candidate_id);
  const interviews = db.getInterviewsByCandidate(candidate.candidate_id);
  const availableJobsCount = db.getAllActiveJobs().length;

  // Profile completion calculation
  let score = 20;
  if (candidate.phone) score += 10;
  if (candidate.education) score += 15;
  if (candidate.skills && candidate.skills.length >= 3) score += 20;
  if (candidate.experience_years !== undefined) score += 15;
  if (db.getCandidateResumes(candidate.candidate_id).length > 0) score += 20;

  const inProgressCount = applications.filter(
    (a) => a.application_status === 'Applied' || a.application_status === 'Under Review'
  ).length;

  const shortlistedCount = applications.filter(
    (a) => a.application_status === 'Shortlisted' || a.application_status === 'Interview Scheduled' || a.application_status === 'Selected'
  ).length;

  res.json({
    candidate,
    stats: {
      profile_completion: Math.min(100, score),
      available_jobs: availableJobsCount,
      jobs_applied: applications.length,
      applications_in_progress: inProgressCount,
      shortlisted_applications: shortlistedCount,
      interviews_scheduled: interviews.filter((i) => i.status === 'Scheduled').length
    },
    recent_applications: applications.slice(0, 5),
    upcoming_interviews: interviews.filter((i) => i.status === 'Scheduled')
  });
});

apiRouter.get('/candidate/profile', requireCandidate, (req: AuthenticatedRequest, res) => {
  res.json({ candidate: req.candidateUser! });
});

apiRouter.put('/candidate/profile', requireCandidate, (req: AuthenticatedRequest, res) => {
  const candidate = req.candidateUser!;
  const updated = db.updateCandidate(candidate.candidate_id, req.body);
  res.json({ candidate: updated });
});

apiRouter.get('/candidate/resumes', requireCandidate, (req: AuthenticatedRequest, res) => {
  const resumes = db.getCandidateResumes(req.candidateUser!.candidate_id);
  res.json({ resumes });
});

// Resume text extraction & creation
apiRouter.post('/candidate/resumes/upload', requireCandidate, (req: AuthenticatedRequest, res) => {
  const candidate = req.candidateUser!;
  const { file_name, raw_text, parsed_skills, parsed_experience, parsed_education } = req.body;

  if (!file_name || !raw_text) {
    return res.status(400).json({ error: 'File name and text content are required' });
  }

  // Automatic skill and entity heuristic extraction from text
  const text = String(raw_text);
  const detectedSkills = new Set<string>();

  // Extract common tech keywords
  const techKeywords = [
    'Python', 'Java', 'SQL', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'AWS',
    'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Redux', 'Tailwind CSS', 'FastAPI', 'Spring Boot',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Selenium', 'Automation Testing', 'Pandas', 'C++',
    'Linux', 'Microservices', 'Kafka', 'REST APIs', 'Tableau', 'Cybersecurity'
  ];

  for (const kw of techKeywords) {
    const regex = new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(text)) {
      detectedSkills.add(kw);
    }
  }

  if (Array.isArray(parsed_skills)) {
    parsed_skills.forEach((s: string) => detectedSkills.add(s));
  }

  const expYears = parsed_experience !== undefined
    ? Number(parsed_experience)
    : candidate.experience_years;

  const newResume: Resume = {
    resume_id: 'RES_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    candidate_id: candidate.candidate_id,
    file_name,
    file_url: `/uploads/${file_name}`,
    extracted_text: text,
    parsed_skills: Array.from(detectedSkills),
    parsed_experience_years: expYears,
    parsed_education: parsed_education || candidate.education || 'B.Tech in Computer Science',
    parsed_projects: ['Production Web Portal', 'Data Analytics Pipeline'],
    parsed_certifications: ['Technical Specialization Certificate'],
    upload_date: new Date().toISOString().split('T')[0]
  };

  db.createResume(newResume);

  res.status(201).json({
    message: 'Resume uploaded and parsed successfully.',
    resume: newResume
  });
});

// SCREENING ENGINE EXECUTION (Before application submission)
// Requirement: Fit score must be generated AFTER candidate selects job and uploads resume!
apiRouter.post('/candidate/screen', requireCandidate, async (req: AuthenticatedRequest, res) => {
  const { job_id, resume_id, resume_payload } = req.body;
  const candidate = req.candidateUser!;

  const job = db.getJobById(job_id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  let resume: Resume | undefined;
  if (resume_id) {
    resume = db.getResumeById(resume_id);
  }

  // Support on-the-fly uploaded resume payload
  if (!resume && resume_payload) {
    resume = {
      resume_id: 'RES_TEMP_' + Date.now(),
      candidate_id: candidate.candidate_id,
      file_name: resume_payload.file_name || 'Candidate_Resume.pdf',
      extracted_text: resume_payload.raw_text || '',
      parsed_skills: resume_payload.parsed_skills || candidate.skills,
      parsed_experience_years: Number(resume_payload.parsed_experience ?? candidate.experience_years),
      parsed_education: resume_payload.parsed_education || candidate.education,
      parsed_projects: resume_payload.parsed_projects || ['Web Service Integration'],
      parsed_certifications: resume_payload.parsed_certifications || [],
      upload_date: new Date().toISOString().split('T')[0]
    };
  }

  if (!resume) {
    return res.status(400).json({ error: 'No resume provided or found for screening' });
  }

  // Get company-specific configurable weights
  const weights = db.getCompanyWeights(job.company_id);

  // Execute rule-based screening engine + Gemini AI semantic matching
  const screeningResult = await runScreeningEngine(job, resume, weights);
  screeningResult.candidate_id = candidate.candidate_id;
  screeningResult.candidate_name = candidate.name;

  res.json({
    message: 'Resume screening completed.',
    screening: screeningResult,
    job: {
      job_id: job.job_id,
      title: job.title,
      company_name: job.company_name,
      required_skills: job.required_skills,
      experience_requirement: job.experience_requirement,
      education_requirement: job.education_requirement
    }
  });
});

// SUBMIT APPLICATION (With screening result stored)
apiRouter.post('/candidate/apply', requireCandidate, async (req: AuthenticatedRequest, res) => {
  const { job_id, resume_id, screening_data } = req.body;
  const candidate = req.candidateUser!;

  const job = db.getJobById(job_id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Check if candidate already applied to this job
  const existingApps = db.getApplicationsByCandidate(candidate.candidate_id);
  const alreadyApplied = existingApps.find((a) => a.job_id === job_id);
  if (alreadyApplied) {
    return res.status(409).json({
      error: 'You have already submitted an application for this role.',
      application: alreadyApplied
    });
  }

  const resume = db.getResumeById(resume_id) || db.getCandidateResumes(candidate.candidate_id)[0];
  if (!resume) {
    return res.status(400).json({ error: 'Please upload a resume before applying.' });
  }

  let finalScreening: ScreeningResult;
  if (screening_data && screening_data.fit_score !== undefined) {
    finalScreening = {
      ...screening_data,
      screening_id: 'SCR_' + Date.now(),
      job_id: job.job_id,
      candidate_id: candidate.candidate_id,
      candidate_name: candidate.name,
      screening_date: new Date().toISOString().split('T')[0]
    };
  } else {
    const weights = db.getCompanyWeights(job.company_id);
    finalScreening = await runScreeningEngine(job, resume, weights);
    finalScreening.candidate_id = candidate.candidate_id;
    finalScreening.candidate_name = candidate.name;
  }

  const applicationId = 'APP_' + Date.now().toString().slice(-6);
  finalScreening.application_id = applicationId;

  // Persist screening result
  db.createScreeningResult(finalScreening);

  // Create Application
  const newApp: Application = {
    application_id: applicationId,
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    candidate_phone: candidate.phone,
    job_id: job.job_id,
    job_title: job.title,
    company_id: job.company_id,
    company_name: job.company_name,
    resume_id: resume.resume_id,
    resume_name: resume.file_name,
    fit_score: finalScreening.fit_score,
    eligibility_status: finalScreening.eligibility_status,
    application_status: 'Applied',
    applied_at: new Date().toISOString().split('T')[0],
    screening_id: finalScreening.screening_id
  };

  db.createApplication(newApp);

  // Notify Candidate
  db.createNotification({
    notification_id: 'NOTIF_' + Date.now(),
    user_id: candidate.candidate_id,
    user_type: 'candidate',
    message: `Application submitted for ${job.title} at ${job.company_name}. Fit score: ${finalScreening.fit_score}%.`,
    created_at: new Date().toISOString().split('T')[0],
    read_status: false,
    type: 'application'
  });

  // Notify HR of the specific company
  const companyHR = db.getHRUsers().find((h) => h.company_id === job.company_id);
  if (companyHR) {
    db.createNotification({
      notification_id: 'NOTIF_HR_' + Date.now(),
      user_id: companyHR.hr_id,
      user_type: 'hr',
      message: `New applicant: ${candidate.name} applied for ${job.title} (Fit Score: ${finalScreening.fit_score}%).`,
      created_at: new Date().toISOString().split('T')[0],
      read_status: false,
      type: 'application'
    });
  }

  res.status(201).json({
    message: 'Application submitted successfully!',
    application: newApp,
    screening: finalScreening
  });
});

apiRouter.get('/candidate/applications', requireCandidate, (req: AuthenticatedRequest, res) => {
  const apps = db.getApplicationsByCandidate(req.candidateUser!.candidate_id);
  res.json({ applications: apps });
});

apiRouter.get('/candidate/interviews', requireCandidate, (req: AuthenticatedRequest, res) => {
  const interviews = db.getInterviewsByCandidate(req.candidateUser!.candidate_id);
  res.json({ interviews });
});

apiRouter.get('/candidate/notifications', requireCandidate, (req: AuthenticatedRequest, res) => {
  const notifs = db.getNotificationsByUser(req.candidateUser!.candidate_id);
  res.json({ notifications: notifs });
});

apiRouter.post('/candidate/notifications/:id/read', requireCandidate, (req: AuthenticatedRequest, res) => {
  const success = db.markNotificationAsRead(req.params.id, req.candidateUser!.candidate_id);
  res.json({ success });
});

// ==========================================
// 4. HR DASHBOARD & MANAGEMENT (STRICT ISOLATION)
// ==========================================

// Enforce that HR can ONLY see data where company_id = hrUser.company_id
apiRouter.get('/hr/dashboard', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const company = db.getCompany(companyId);

  const jobs = db.getJobsByCompany(companyId);
  const activeJobs = jobs.filter((j) => j.status === 'Active');
  const applications = db.getApplicationsByCompany(companyId);
  const eligibleCandidates = applications.filter((a) => a.eligibility_status === 'Eligible');
  const shortlistedCandidates = applications.filter(
    (a) => a.application_status === 'Shortlisted' || a.application_status === 'Interview Scheduled' || a.application_status === 'Selected'
  );
  const interviews = db.getInterviewsByCompany(companyId);
  const scheduledInterviews = interviews.filter((i) => i.status === 'Scheduled');

  res.json({
    hr_user: req.hrUser,
    company,
    stats: {
      total_jobs: jobs.length,
      active_jobs: activeJobs.length,
      total_applicants: applications.length,
      eligible_candidates: eligibleCandidates.length,
      shortlisted_candidates: shortlistedCandidates.length,
      interviews_scheduled: scheduledInterviews.length
    },
    recent_applicants: applications.slice(0, 8),
    recent_jobs: jobs.slice(0, 5)
  });
});

// Jobs Management (Strict company_id enforcement)
apiRouter.get('/hr/jobs', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const jobs = db.getJobsByCompany(companyId);
  res.json({ jobs });
});

apiRouter.post('/hr/jobs', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const company = db.getCompany(companyId);
  const {
    title,
    description,
    required_skills,
    education_requirement,
    experience_requirement,
    location,
    employment_type,
    salary_range,
    deadline
  } = req.body;

  if (!title || !description || !required_skills) {
    return res.status(400).json({ error: 'Title, description, and required skills are required' });
  }

  const skillsArr = Array.isArray(required_skills)
    ? required_skills
    : typeof required_skills === 'string'
    ? required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const newJob: Job = {
    job_id: `JOB_${companyId}_${Date.now().toString().slice(-4)}`,
    company_id: companyId,
    company_name: company?.company_name || 'Enterprise',
    title,
    description,
    required_skills: skillsArr,
    education_requirement: education_requirement || 'B.Tech / MCA / Equivalent',
    experience_requirement: Number(experience_requirement) || 0,
    location: location || company?.location || 'Bengaluru, India',
    employment_type: employment_type || 'Full-time',
    salary_range: salary_range || 'Competitive',
    deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
    created_at: new Date().toISOString().split('T')[0]
  };

  db.createJob(newJob);

  res.status(201).json({
    message: 'Job created successfully',
    job: newJob
  });
});

apiRouter.put('/hr/jobs/:id', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const jobId = req.params.id;

  const existing = db.getJobById(jobId);
  if (!existing) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // STRICT AUTHORIZATION CHECK
  if (existing.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied: You can only modify your own company jobs.' });
  }

  const updated = db.updateJob(jobId, companyId, req.body);
  res.json({ message: 'Job updated successfully', job: updated });
});

apiRouter.delete('/hr/jobs/:id', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const jobId = req.params.id;

  const existing = db.getJobById(jobId);
  if (!existing) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // STRICT AUTHORIZATION CHECK
  if (existing.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied: You can only delete your own company jobs.' });
  }

  const success = db.deleteJob(jobId, companyId);
  res.json({ success, message: 'Job deleted/closed successfully' });
});

// Applicants Management (Strict company_id enforcement)
apiRouter.get('/hr/applicants', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  let applications = db.getApplicationsByCompany(companyId);

  const { job_id, fit_score_min, eligibility, status, search } = req.query;

  if (job_id && job_id !== 'All') {
    applications = applications.filter((a) => a.job_id === job_id);
  }

  if (fit_score_min) {
    const minScore = Number(fit_score_min);
    if (!isNaN(minScore)) {
      applications = applications.filter((a) => a.fit_score >= minScore);
    }
  }

  if (eligibility && eligibility !== 'All') {
    applications = applications.filter((a) => a.eligibility_status === eligibility);
  }

  if (status && status !== 'All') {
    applications = applications.filter((a) => a.application_status === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.candidate_name.toLowerCase().includes(s) ||
        a.candidate_id.toLowerCase().includes(s) ||
        a.job_title.toLowerCase().includes(s)
    );
  }

  // Enrich with candidate details for HR view
  const enriched = applications.map((app) => {
    const candidate = db.getCandidateById(app.candidate_id);
    return {
      ...app,
      candidate_skills: candidate?.skills || [],
      candidate_experience: candidate?.experience_years ?? 0,
      candidate_education: candidate?.education || 'N/A',
      candidate_location: candidate?.location || 'N/A'
    };
  });

  res.json({ applicants: enriched });
});

// Candidate Detailed Screening View
apiRouter.get('/hr/applicants/:id/screening', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const appId = req.params.id;

  const app = db.getApplicationById(appId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // STRICT AUTHORIZATION CHECK
  if (app.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied: Application belongs to another company.' });
  }

  let screening = db.getScreeningResultByApplication(appId);
  if (!screening && app.screening_id) {
    screening = db.getScreeningResultById(app.screening_id);
  }

  const job = db.getJobById(app.job_id);
  const candidate = db.getCandidateById(app.candidate_id);
  const resume = db.getResumeById(app.resume_id);

  res.json({
    application: app,
    screening,
    job,
    candidate,
    resume
  });
});

// Update Application Status (Shortlist, Reject, etc.)
apiRouter.post('/hr/applicants/:id/status', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const appId = req.params.id;
  const { status } = req.body;

  const app = db.getApplicationById(appId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // STRICT AUTHORIZATION CHECK
  if (app.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied: Application belongs to another company.' });
  }

  const updated = db.updateApplicationStatus(appId, companyId, status);

  // Notify Candidate of status change
  db.createNotification({
    notification_id: 'NOTIF_' + Date.now(),
    user_id: app.candidate_id,
    user_type: 'candidate',
    message: `Your application status for ${app.job_title} at ${app.company_name} was updated to: ${status}.`,
    created_at: new Date().toISOString().split('T')[0],
    read_status: false,
    type: 'status_update'
  });

  res.json({ message: 'Application status updated', application: updated });
});

// Pre-Ranking Engine
apiRouter.get('/hr/ranking', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const { job_id } = req.query;

  const jobs = db.getJobsByCompany(companyId);
  const selectedJobId = (job_id as string) || (jobs[0]?.job_id ?? '');

  if (!selectedJobId) {
    return res.json({ rankings: [], jobs });
  }

  const applications = db.getApplicationsByCompany(companyId).filter((a) => a.job_id === selectedJobId);

  // Calculate pre-ranking based on fit score, matching skills, experience
  const ranked = applications.map((app) => {
    const candidate = db.getCandidateById(app.candidate_id);
    let screening = db.getScreeningResultByApplication(app.application_id);
    if (!screening && app.screening_id) {
      screening = db.getScreeningResultById(app.screening_id);
    }

    const skillsScore = screening?.breakdown?.skills_score ?? (app.fit_score >= 80 ? 90 : 70);

    return {
      application_id: app.application_id,
      candidate_id: app.candidate_id,
      candidate_name: app.candidate_name,
      fit_score: app.fit_score,
      skills_match: `${skillsScore}%`,
      experience: `${candidate?.experience_years ?? 0} year(s)`,
      eligibility_status: app.eligibility_status,
      application_status: app.application_status,
      matching_skills_count: screening?.matching_skills?.length ?? 0,
      applied_at: app.applied_at
    };
  });

  // Sort descending by fit score, then by matching skills count
  ranked.sort((a, b) => {
    if (b.fit_score !== a.fit_score) {
      return b.fit_score - a.fit_score;
    }
    return b.matching_skills_count - a.matching_skills_count;
  });

  const rankingsWithRank = ranked.map((item, index) => ({
    rank: index + 1,
    ...item
  }));

  res.json({
    rankings: rankingsWithRank,
    jobs,
    selected_job: jobs.find((j) => j.job_id === selectedJobId)
  });
});

// Interviews Management (Strict company_id enforcement)
apiRouter.get('/hr/interviews', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const interviews = db.getInterviewsByCompany(companyId);
  res.json({ interviews });
});

apiRouter.post('/hr/interviews/schedule', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const company = db.getCompany(companyId);
  const {
    application_id,
    interview_date,
    interview_time,
    interview_type,
    notes,
    meeting_link
  } = req.body;

  const app = db.getApplicationById(application_id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // STRICT AUTHORIZATION CHECK
  if (app.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied: Application belongs to another company.' });
  }

  const newInterview: Interview = {
    interview_id: 'INT_' + Date.now().toString().slice(-6),
    application_id,
    company_id: companyId,
    company_name: company?.company_name || 'Enterprise',
    candidate_id: app.candidate_id,
    candidate_name: app.candidate_name,
    job_title: app.job_title,
    interview_date,
    interview_time,
    interview_type: interview_type || 'Technical',
    status: 'Scheduled',
    notes: notes || '',
    meeting_link: meeting_link || 'https://meet.google.com/recruitment-session',
    created_at: new Date().toISOString().split('T')[0]
  };

  db.createInterview(newInterview);

  // Update application status to Interview Scheduled
  db.updateApplicationStatus(application_id, companyId, 'Interview Scheduled');

  // Notify Candidate
  db.createNotification({
    notification_id: 'NOTIF_' + Date.now(),
    user_id: app.candidate_id,
    user_type: 'candidate',
    message: `Interview scheduled with ${company?.company_name} for ${app.job_title} on ${interview_date} at ${interview_time}.`,
    created_at: new Date().toISOString().split('T')[0],
    read_status: false,
    type: 'interview'
  });

  res.status(201).json({
    message: 'Interview scheduled successfully',
    interview: newInterview
  });
});

apiRouter.put('/hr/interviews/:id/status', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const interviewId = req.params.id;
  const { status } = req.body;

  const updated = db.updateInterviewStatus(interviewId, companyId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Interview not found or unauthorized' });
  }

  res.json({ message: 'Interview status updated', interview: updated });
});

// Company Profile & Screening Rules Settings
apiRouter.get('/hr/company', requireHR, (req: AuthenticatedRequest, res) => {
  const company = db.getCompany(req.hrUser!.company_id);
  res.json({ company });
});

apiRouter.put('/hr/company', requireHR, (req: AuthenticatedRequest, res) => {
  const company = db.updateCompany(req.hrUser!.company_id, req.body);
  res.json({ company });
});

apiRouter.get('/hr/settings/weights', requireHR, (req: AuthenticatedRequest, res) => {
  const weights = db.getCompanyWeights(req.hrUser!.company_id);
  res.json({ weights });
});

apiRouter.put('/hr/settings/weights', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const updated = db.setCompanyWeights(companyId, req.body);
  res.json({ message: 'Screening weights updated successfully', weights: updated });
});

// Reports & Analytics
apiRouter.get('/hr/reports', requireHR, (req: AuthenticatedRequest, res) => {
  const companyId = req.hrUser!.company_id;
  const applications = db.getApplicationsByCompany(companyId);
  const jobs = db.getJobsByCompany(companyId);

  // Status distribution
  const statusCounts: Record<string, number> = {};
  applications.forEach((a) => {
    statusCounts[a.application_status] = (statusCounts[a.application_status] || 0) + 1;
  });

  // Fit score distribution
  const scoreBuckets = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '50-69%': 0,
    '<50%': 0
  };

  applications.forEach((a) => {
    if (a.fit_score >= 90) scoreBuckets['90-100%']++;
    else if (a.fit_score >= 80) scoreBuckets['80-89%']++;
    else if (a.fit_score >= 70) scoreBuckets['70-79%']++;
    else if (a.fit_score >= 50) scoreBuckets['50-69%']++;
    else scoreBuckets['<50%']++;
  });

  // Job application breakdown
  const jobBreakdown = jobs.map((j) => {
    const jobApps = applications.filter((a) => a.job_id === j.job_id);
    const avgScore = jobApps.length > 0
      ? Math.round(jobApps.reduce((acc, curr) => acc + curr.fit_score, 0) / jobApps.length)
      : 0;
    return {
      job_id: j.job_id,
      title: j.title,
      total_applicants: jobApps.length,
      average_fit_score: avgScore,
      shortlisted_count: jobApps.filter((a) => a.application_status === 'Shortlisted' || a.application_status === 'Interview Scheduled').length
    };
  });

  res.json({
    total_applicants: applications.length,
    status_counts: statusCounts,
    score_distribution: scoreBuckets,
    job_breakdown: jobBreakdown
  });
});
