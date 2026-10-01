export interface Company {
  company_id: string;
  company_name: string;
  industry: string;
  location: string;
  logo_color: string;
  description: string;
  website?: string;
}

export interface HRUser {
  hr_id: string;
  company_id: string;
  name: string;
  email: string;
  password: string;
  role: 'HR';
}

export interface Candidate {
  candidate_id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  education: string;
  graduation_year: string;
  skills: string[];
  experience_years: number;
  preferred_role: string;
  preferred_location: string;
  created_at: string;
}

export interface Job {
  job_id: string;
  company_id: string;
  company_name: string;
  title: string;
  description: string;
  required_skills: string[];
  education_requirement: string;
  experience_requirement: number; // in years
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salary_range?: string;
  deadline: string;
  status: 'Active' | 'Closed' | 'Draft';
  created_at: string;
}

export interface Resume {
  resume_id: string;
  candidate_id: string;
  file_name: string;
  file_url?: string;
  extracted_text: string;
  parsed_skills: string[];
  parsed_experience_years: number;
  parsed_education: string;
  parsed_projects: string[];
  parsed_certifications: string[];
  upload_date: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected';

export type EligibilityStatus = 'Eligible' | 'Review Needed' | 'Not Eligible';

export interface ScreeningWeights {
  skills_weight: number;      // e.g. 50
  education_weight: number;   // e.g. 20
  experience_weight: number;  // e.g. 20
  projects_weight: number;    // e.g. 10
  min_passing_score: number;  // e.g. 70
}

export interface ScreeningResult {
  screening_id: string;
  application_id?: string;
  job_id: string;
  candidate_id: string;
  candidate_name: string;
  matching_skills: string[];
  missing_skills: string[];
  education_match: boolean;
  education_details: string;
  experience_match: boolean;
  experience_details: string;
  fit_score: number; // 0 - 100
  eligibility_status: EligibilityStatus;
  breakdown: {
    skills_score: number;
    education_score: number;
    experience_score: number;
    projects_score: number;
    weights_used: ScreeningWeights;
  };
  ai_analysis?: {
    keyword_match_summary: string;
    strengths: string[];
    potential_gaps: string[];
    suggested_interview_questions: string[];
    recommendation: string;
  };
  screening_date: string;
}

export interface Application {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  job_id: string;
  job_title: string;
  company_id: string;
  company_name: string;
  resume_id: string;
  resume_name: string;
  fit_score: number;
  eligibility_status: EligibilityStatus;
  application_status: ApplicationStatus;
  applied_at: string;
  screening_id?: string;
}

export interface Interview {
  interview_id: string;
  application_id: string;
  company_id: string;
  company_name: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  interview_date: string;
  interview_time: string;
  interview_type: 'Technical' | 'HR Round' | 'Managerial' | 'Cultural Fit';
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes: string;
  meeting_link: string;
  created_at: string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  user_type: 'candidate' | 'hr';
  message: string;
  created_at: string;
  read_status: boolean;
  type?: 'application' | 'interview' | 'status_update';
}
