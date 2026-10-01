import fs from 'fs';
import path from 'path';
import {
  Company,
  HRUser,
  Candidate,
  Job,
  Resume,
  Application,
  ScreeningResult,
  Interview,
  Notification,
  ScreeningWeights
} from '../src/types/index';

interface DatabaseSchema {
  companies: Company[];
  hr_users: HRUser[];
  candidates: Candidate[];
  jobs: Job[];
  resumes: Resume[];
  applications: Application[];
  screening_results: ScreeningResult[];
  interviews: Interview[];
  notifications: Notification[];
  company_weights: Record<string, ScreeningWeights>;
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'hirescreen_db.json');

const DEFAULT_WEIGHTS: ScreeningWeights = {
  skills_weight: 50,
  education_weight: 20,
  experience_weight: 20,
  projects_weight: 10,
  min_passing_score: 70
};

// Seed initial realistic college demo data
function generateSeedData(): DatabaseSchema {
  const companies: Company[] = [
    {
      company_id: 'INF001',
      company_name: 'Infosys',
      industry: 'IT & Cloud Solutions',
      location: 'Bengaluru, India',
      logo_color: 'bg-blue-600',
      description: 'A global leader in next-generation digital services and consulting.',
      website: 'https://www.infosys.com'
    },
    {
      company_id: 'TCS001',
      company_name: 'TCS (Tata Consultancy Services)',
      industry: 'Information Technology & Consulting',
      location: 'Mumbai, India',
      logo_color: 'bg-sky-600',
      description: 'An IT services, consulting and business solutions organization delivering real results.',
      website: 'https://www.tcs.com'
    },
    {
      company_id: 'WIP001',
      company_name: 'Wipro',
      industry: 'IT & Business Process Services',
      location: 'Bengaluru, India',
      logo_color: 'bg-emerald-600',
      description: 'A leading technology services and consulting company focused on building innovative solutions.',
      website: 'https://www.wipro.com'
    },
    {
      company_id: 'ACC001',
      company_name: 'Accenture',
      industry: 'Management & IT Consulting',
      location: 'Hyderabad, India',
      logo_color: 'bg-purple-600',
      description: 'A global professional services company with leading capabilities in digital, cloud and security.',
      website: 'https://www.accenture.com'
    },
    {
      company_id: 'HCL001',
      company_name: 'HCLTech',
      industry: 'Digital Engineering & Tech Services',
      location: 'Noida, India',
      logo_color: 'bg-cyan-600',
      description: 'Supercharging progress through world-class engineering, digital capabilities and tech platforms.',
      website: 'https://www.hcltech.com'
    },
    {
      company_id: 'TM001',
      company_name: 'Tech Mahindra',
      industry: 'Connected World & Digital Transformation',
      location: 'Pune, India',
      logo_color: 'bg-rose-600',
      description: 'Offering innovative and customer-centric digital experiences, enabling enterprises to Rise.',
      website: 'https://www.techmahindra.com'
    }
  ];

  const hr_users: HRUser[] = [
    {
      hr_id: 'HR_INF_01',
      company_id: 'INF001',
      name: 'Aditi Rao',
      email: 'hr@infosys.com',
      password: 'password123',
      role: 'HR'
    },
    {
      hr_id: 'HR_TCS_01',
      company_id: 'TCS001',
      name: 'Rajesh Mehta',
      email: 'hr@tcs.com',
      password: 'password123',
      role: 'HR'
    },
    {
      hr_id: 'HR_WIP_01',
      company_id: 'WIP001',
      name: 'Kavita Nair',
      email: 'hr@wipro.com',
      password: 'password123',
      role: 'HR'
    },
    {
      hr_id: 'HR_ACC_01',
      company_id: 'ACC001',
      name: 'Deepak Joshi',
      email: 'hr@accenture.com',
      password: 'password123',
      role: 'HR'
    },
    {
      hr_id: 'HR_HCL_01',
      company_id: 'HCL001',
      name: 'Sunita Sharma',
      email: 'hr@hcltech.com',
      password: 'password123',
      role: 'HR'
    },
    {
      hr_id: 'HR_TM_01',
      company_id: 'TM001',
      name: 'Sameer Kulkarni',
      email: 'hr@techmahindra.com',
      password: 'password123',
      role: 'HR'
    }
  ];

  const candidates: Candidate[] = [
    {
      candidate_id: 'CAN_101',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@gmail.com',
      phone: '+91 98765 43210',
      password: 'password123',
      location: 'Bengaluru, India',
      education: 'B.Tech in Computer Science',
      graduation_year: '2023',
      skills: ['Python', 'Java', 'SQL', 'React', 'Git', 'FastAPI'],
      experience_years: 2,
      preferred_role: 'Software Developer',
      preferred_location: 'Bengaluru',
      created_at: '2026-08-10'
    },
    {
      candidate_id: 'CAN_102',
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91 98123 45678',
      password: 'password123',
      location: 'Pune, India',
      education: 'B.E. in Information Technology',
      graduation_year: '2022',
      skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Redux', 'REST APIs'],
      experience_years: 3,
      preferred_role: 'Frontend Engineer',
      preferred_location: 'Pune / Remote',
      created_at: '2026-08-12'
    },
    {
      candidate_id: 'CAN_103',
      name: 'Rohan Verma',
      email: 'rohan.verma@gmail.com',
      phone: '+91 97234 56789',
      password: 'password123',
      location: 'Hyderabad, India',
      education: 'MCA - Master of Computer Applications',
      graduation_year: '2021',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'Python', 'CI/CD'],
      experience_years: 4,
      preferred_role: 'DevOps & Cloud Engineer',
      preferred_location: 'Hyderabad',
      created_at: '2026-08-15'
    },
    {
      candidate_id: 'CAN_104',
      name: 'Ananya Sen',
      email: 'ananya.sen@gmail.com',
      phone: '+91 96345 67890',
      password: 'password123',
      location: 'Mumbai, India',
      education: 'B.Tech in Information Science',
      graduation_year: '2024',
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'Docker'],
      experience_years: 1,
      preferred_role: 'Java Backend Developer',
      preferred_location: 'Mumbai',
      created_at: '2026-08-20'
    },
    {
      candidate_id: 'CAN_105',
      name: 'Vikram Patel',
      email: 'vikram.patel@gmail.com',
      phone: '+91 95456 78901',
      password: 'password123',
      location: 'Noida, India',
      education: 'B.Sc in Computer Science',
      graduation_year: '2025',
      skills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Tableau'],
      experience_years: 0.5,
      preferred_role: 'Junior Data Analyst',
      preferred_location: 'Delhi NCR',
      created_at: '2026-09-01'
    }
  ];

  const jobs: Job[] = [
    // Infosys Jobs
    {
      job_id: 'JOB_INF_01',
      company_id: 'INF001',
      company_name: 'Infosys',
      title: 'Full Stack Software Engineer',
      description: 'We are seeking an enthusiastic Full Stack Engineer to architect modern cloud services. You will design responsive frontends in React and resilient backend services using Java or Python and relational databases.',
      required_skills: ['Python', 'Java', 'SQL', 'React', 'AWS'],
      education_requirement: 'B.Tech / B.E / MCA in Computer Science or related',
      experience_requirement: 2,
      location: 'Bengaluru, India',
      employment_type: 'Full-time',
      salary_range: '₹8,00,000 - ₹12,00,000 PA',
      deadline: '2026-10-30',
      status: 'Active',
      created_at: '2026-09-01'
    },
    {
      job_id: 'JOB_INF_02',
      company_id: 'INF001',
      company_name: 'Infosys',
      title: 'Cloud DevOps Specialist',
      description: 'Responsible for CI/CD pipelines, container orchestration, AWS infrastructure as code, and site reliability monitoring.',
      required_skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      education_requirement: 'B.Tech / MCA',
      experience_requirement: 3,
      location: 'Bengaluru / Hybrid',
      employment_type: 'Full-time',
      salary_range: '₹11,00,000 - ₹16,00,000 PA',
      deadline: '2026-11-15',
      status: 'Active',
      created_at: '2026-09-05'
    },
    {
      job_id: 'JOB_INF_03',
      company_id: 'INF001',
      company_name: 'Infosys',
      title: 'Associate QA Automation Tester',
      description: 'Design automated test suites with Selenium, Playwright, and Python for enterprise banking solutions.',
      required_skills: ['Selenium', 'Python', 'Git', 'SQL', 'Automation Testing'],
      education_requirement: 'B.Tech / B.Sc / BCA',
      experience_requirement: 1,
      location: 'Mysuru / Bengaluru',
      employment_type: 'Full-time',
      salary_range: '₹5,00,000 - ₹7,50,000 PA',
      deadline: '2026-10-25',
      status: 'Active',
      created_at: '2026-09-10'
    },

    // TCS Jobs
    {
      job_id: 'JOB_TCS_01',
      company_id: 'TCS001',
      company_name: 'TCS (Tata Consultancy Services)',
      title: 'Senior Frontend Developer (React/TypeScript)',
      description: 'Build enterprise-grade single page applications for premier financial clients. Deep expertise in React hooks, state management, and modern CSS frameworks required.',
      required_skills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'REST APIs'],
      education_requirement: 'B.Tech / B.E / MCA',
      experience_requirement: 3,
      location: 'Mumbai / Pune',
      employment_type: 'Full-time',
      salary_range: '₹9,00,000 - ₹14,00,000 PA',
      deadline: '2026-11-01',
      status: 'Active',
      created_at: '2026-09-02'
    },
    {
      job_id: 'JOB_TCS_02',
      company_id: 'TCS001',
      company_name: 'TCS (Tata Consultancy Services)',
      title: 'Java Microservices Backend Architect',
      description: 'Develop distributed enterprise backends with Spring Boot, Kafka, and PostgreSQL in high-throughput environments.',
      required_skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka'],
      education_requirement: 'B.Tech / M.Tech',
      experience_requirement: 4,
      location: 'Chennai / Mumbai',
      employment_type: 'Full-time',
      salary_range: '₹13,00,000 - ₹18,00,000 PA',
      deadline: '2026-11-20',
      status: 'Active',
      created_at: '2026-09-08'
    },

    // Wipro Jobs
    {
      job_id: 'JOB_WIP_01',
      company_id: 'WIP001',
      company_name: 'Wipro',
      title: 'Data & Machine Learning Associate',
      description: 'Join our Analytics Center of Excellence to analyze high-volume client datasets and build predictive ETL models.',
      required_skills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Tableau', 'Scikit-Learn'],
      education_requirement: 'B.Tech / B.Sc / M.Sc',
      experience_requirement: 1,
      location: 'Bengaluru / Hyderabad',
      employment_type: 'Full-time',
      salary_range: '₹6,50,000 - ₹9,50,000 PA',
      deadline: '2026-10-31',
      status: 'Active',
      created_at: '2026-09-04'
    },
    {
      job_id: 'JOB_WIP_02',
      company_id: 'WIP001',
      company_name: 'Wipro',
      title: 'Cybersecurity Analyst',
      description: 'Monitor threat vectors, conduct vulnerability scans, and implement SOC incident handling procedures.',
      required_skills: ['Network Security', 'Linux', 'SIEM', 'Python', 'Ethical Hacking'],
      education_requirement: 'B.Tech / BCA / MCA',
      experience_requirement: 2,
      location: 'Bengaluru',
      employment_type: 'Full-time',
      salary_range: '₹7,50,000 - ₹11,00,000 PA',
      deadline: '2026-11-10',
      status: 'Active',
      created_at: '2026-09-07'
    },

    // Accenture Jobs
    {
      job_id: 'JOB_ACC_01',
      company_id: 'ACC001',
      company_name: 'Accenture',
      title: 'Enterprise Cloud Solutions Architect',
      description: 'Lead digital transformation journeys for Fortune 500 enterprises with multi-cloud deployments.',
      required_skills: ['AWS', 'Kubernetes', 'Docker', 'Microservices', 'Terraform', 'Java'],
      education_requirement: 'B.Tech / M.Tech / MCA',
      experience_requirement: 4,
      location: 'Hyderabad / Gurugram',
      employment_type: 'Full-time',
      salary_range: '₹14,00,000 - ₹20,00,000 PA',
      deadline: '2026-11-25',
      status: 'Active',
      created_at: '2026-09-06'
    },

    // HCLTech Jobs
    {
      job_id: 'JOB_HCL_01',
      company_id: 'HCL001',
      company_name: 'HCLTech',
      title: 'C++ & Embedded Systems Engineer',
      description: 'Develop low-latency device firmware and IoT gateway protocol drivers.',
      required_skills: ['C++', 'Linux', 'RTOS', 'Git', 'Embedded Systems'],
      education_requirement: 'B.Tech in ECE / CSE',
      experience_requirement: 2,
      location: 'Noida / Chennai',
      employment_type: 'Full-time',
      salary_range: '₹7,00,000 - ₹10,50,000 PA',
      deadline: '2026-10-28',
      status: 'Active',
      created_at: '2026-09-03'
    },

    // Tech Mahindra Jobs
    {
      job_id: 'JOB_TM_01',
      company_id: 'TM001',
      company_name: 'Tech Mahindra',
      title: '5G Network Software Engineer',
      description: 'Build telecom virtualization microservices and cloud-native network functions (CNFs).',
      required_skills: ['Python', 'Docker', 'Kubernetes', 'Linux', 'Networking', 'Go'],
      education_requirement: 'B.Tech in CSE / Telecom',
      experience_requirement: 2,
      location: 'Pune / Hyderabad',
      employment_type: 'Full-time',
      salary_range: '₹8,00,000 - ₹12,50,000 PA',
      deadline: '2026-11-12',
      status: 'Active',
      created_at: '2026-09-09'
    }
  ];

  const resumes: Resume[] = [
    {
      resume_id: 'RES_101',
      candidate_id: 'CAN_101',
      file_name: 'Rahul_Kumar_Software_Engineer.pdf',
      extracted_text: `RAHUL KUMAR
Email: rahul.kumar@gmail.com | Phone: +91 98765 43210 | Bengaluru, India
GitHub: github.com/rahulkumar | LinkedIn: linkedin.com/in/rahulkumar

PROFESSIONAL SUMMARY:
Results-driven Software Engineer with 2 years of experience crafting scalable web backends and responsive user interfaces. Proven track record in Python (FastAPI/Django), Java, SQL relational database modeling, and React frontend development.

TECHNICAL SKILLS:
- Languages: Python, Java, SQL, JavaScript, HTML/CSS
- Frameworks & Libraries: React, FastAPI, Spring Boot (Basics), Node.js
- Tools & Cloud: Git, GitHub, Docker (Familiar), PostgreSQL, MySQL
- Methodologies: Agile/Scrum, Test-Driven Development, REST APIs

WORK EXPERIENCE:
Junior Software Engineer | TechNova Solutions, Bengaluru (2024 - Present)
- Developed RESTful API microservices in Python and FastAPI handling 15k+ daily requests.
- Built interactive analytics dashboards using React, Tailwind CSS, and SQL reporting queries.
- Optimized slow SQL queries, reducing database query execution latency by 35%.

EDUCATION:
B.Tech in Computer Science and Engineering
VTU Bengaluru | Graduated: 2023 | CGPA: 8.6/10

PROJECTS:
1. Cloud Inventory Tracker: Real-time inventory service using Python, React, PostgreSQL.
2. CodeReview Bot: Git webhook automation service analyzing pull request changes.

CERTIFICATIONS:
- Oracle Certified Associate, Java SE 8 Programmer
- Python for Data Science and Machine Learning Bootcamp`,
      parsed_skills: ['Python', 'Java', 'SQL', 'React', 'Git', 'FastAPI', 'PostgreSQL', 'Docker'],
      parsed_experience_years: 2,
      parsed_education: 'B.Tech in Computer Science',
      parsed_projects: ['Cloud Inventory Tracker', 'CodeReview Bot'],
      parsed_certifications: ['Oracle Certified Associate Java', 'Python Bootcamp'],
      upload_date: '2026-09-10'
    },
    {
      resume_id: 'RES_102',
      candidate_id: 'CAN_102',
      file_name: 'Priya_Sharma_Frontend_Specialist.pdf',
      extracted_text: `PRIYA SHARMA
Frontend Specialist | React & TypeScript
Email: priya.sharma@gmail.com | Phone: +91 98123 45678 | Pune, India

SUMMARY:
Passionate Frontend Engineer with 3 years of hands-on experience designing modern enterprise web applications. Highly proficient in React, TypeScript, Redux Toolkit, Tailwind CSS, and REST API integration.

TECHNICAL SKILLS:
- Frontend: React, TypeScript, Redux, Next.js, HTML5, CSS3, Tailwind CSS
- State & APIs: React Query, REST APIs, GraphQL (Basics)
- Tools: Git, Vite, Webpack, Jest, Figma

EXPERIENCE:
Frontend Engineer | Apex Digital Labs (2023 - Present)
- Architected modular design system in React and Tailwind CSS across 4 client applications.
- Integrated high-throughput RESTful endpoints using Axios and Redux state caching.

EDUCATION:
B.E. in Information Technology
Pune University | Graduated: 2022 | First Class with Distinction`,
      parsed_skills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'REST APIs', 'Git', 'Node.js'],
      parsed_experience_years: 3,
      parsed_education: 'B.E. in Information Technology',
      parsed_projects: ['Apex Design System', 'E-Commerce Checkout Portal'],
      parsed_certifications: ['Meta Certified Front-End Developer'],
      upload_date: '2026-09-11'
    }
  ];

  // Seed sample applications
  const applications: Application[] = [
    {
      application_id: 'APP_001',
      candidate_id: 'CAN_101',
      candidate_name: 'Rahul Kumar',
      candidate_email: 'rahul.kumar@gmail.com',
      candidate_phone: '+91 98765 43210',
      job_id: 'JOB_INF_01',
      job_title: 'Full Stack Software Engineer',
      company_id: 'INF001',
      company_name: 'Infosys',
      resume_id: 'RES_101',
      resume_name: 'Rahul_Kumar_Software_Engineer.pdf',
      fit_score: 86,
      eligibility_status: 'Eligible',
      application_status: 'Shortlisted',
      applied_at: '2026-09-12',
      screening_id: 'SCR_001'
    },
    {
      application_id: 'APP_002',
      candidate_id: 'CAN_102',
      candidate_name: 'Priya Sharma',
      candidate_email: 'priya.sharma@gmail.com',
      candidate_phone: '+91 98123 45678',
      job_id: 'JOB_TCS_01',
      job_title: 'Senior Frontend Developer (React/TypeScript)',
      company_id: 'TCS001',
      company_name: 'TCS (Tata Consultancy Services)',
      resume_id: 'RES_102',
      resume_name: 'Priya_Sharma_Frontend_Specialist.pdf',
      fit_score: 95,
      eligibility_status: 'Eligible',
      application_status: 'Interview Scheduled',
      applied_at: '2026-09-13',
      screening_id: 'SCR_002'
    },
    {
      application_id: 'APP_003',
      candidate_id: 'CAN_101',
      candidate_name: 'Rahul Kumar',
      candidate_email: 'rahul.kumar@gmail.com',
      candidate_phone: '+91 98765 43210',
      job_id: 'JOB_INF_03',
      job_title: 'Associate QA Automation Tester',
      company_id: 'INF001',
      company_name: 'Infosys',
      resume_id: 'RES_101',
      resume_name: 'Rahul_Kumar_Software_Engineer.pdf',
      fit_score: 74,
      eligibility_status: 'Eligible',
      application_status: 'Under Review',
      applied_at: '2026-09-14',
      screening_id: 'SCR_003'
    }
  ];

  const screening_results: ScreeningResult[] = [
    {
      screening_id: 'SCR_001',
      application_id: 'APP_001',
      job_id: 'JOB_INF_01',
      candidate_id: 'CAN_101',
      candidate_name: 'Rahul Kumar',
      matching_skills: ['Python', 'Java', 'SQL', 'React'],
      missing_skills: ['AWS'],
      education_match: true,
      education_details: 'Candidate has B.Tech in CS (Meets requirement B.Tech / B.E / MCA)',
      experience_match: true,
      experience_details: 'Candidate has 2 years (Meets requirement of 2 years)',
      fit_score: 86,
      eligibility_status: 'Eligible',
      breakdown: {
        skills_score: 80, // 4 out of 5 skills
        education_score: 100,
        experience_score: 100,
        projects_score: 80,
        weights_used: DEFAULT_WEIGHTS
      },
      ai_analysis: {
        keyword_match_summary: 'Strong match on primary core engineering stack (Python, Java, React, SQL). The only notable gap is production AWS certification/cloud infrastructure, which can be acquired on the job.',
        strengths: ['Hands-on full stack versatility', 'Solid CS fundamentals and SQL query optimization', 'FastAPI & React demonstrated in real projects'],
        potential_gaps: ['No direct AWS cloud operations mentioned in resume', 'Familiar with Docker but lacks production container orchestration'],
        suggested_interview_questions: [
          'How do you handle cross-origin resource sharing and state synchronization between React and your FastAPI backend?',
          'Walk through your approach to indexing and query optimization in PostgreSQL.'
        ],
        recommendation: 'Highly Recommended for Technical Interview Round.'
      },
      screening_date: '2026-09-12'
    },
    {
      screening_id: 'SCR_002',
      application_id: 'APP_002',
      job_id: 'JOB_TCS_01',
      candidate_id: 'CAN_102',
      candidate_name: 'Priya Sharma',
      matching_skills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'REST APIs'],
      missing_skills: [],
      education_match: true,
      education_details: 'Candidate has B.E. in IT (Meets requirement B.Tech / B.E / MCA)',
      experience_match: true,
      experience_details: 'Candidate has 3 years (Meets requirement of 3 years)',
      fit_score: 95,
      eligibility_status: 'Eligible',
      breakdown: {
        skills_score: 100, // 5 out of 5 skills
        education_score: 100,
        experience_score: 100,
        projects_score: 75,
        weights_used: DEFAULT_WEIGHTS
      },
      ai_analysis: {
        keyword_match_summary: 'Exceptional 100% keyword coverage across all required frontend technologies. Verified 3 years of enterprise React & TypeScript experience.',
        strengths: ['Complete alignment with required tech stack', 'Demonstrated component library architectural experience', 'Strong state management with Redux'],
        potential_gaps: ['Testing frameworks (e.g. Cypress or Jest) could be probed further in the interview'],
        suggested_interview_questions: [
          'How do you structure custom middleware and selectors in Redux Toolkit for complex state trees?',
          'Discuss how you optimize React re-renders in heavy tabular data grids.'
        ],
        recommendation: 'Top candidate for Senior Frontend role. Fast-track to Managerial Round.'
      },
      screening_date: '2026-09-13'
    },
    {
      screening_id: 'SCR_003',
      application_id: 'APP_003',
      job_id: 'JOB_INF_03',
      candidate_id: 'CAN_101',
      candidate_name: 'Rahul Kumar',
      matching_skills: ['Python', 'Git', 'SQL'],
      missing_skills: ['Selenium', 'Automation Testing'],
      education_match: true,
      education_details: 'Candidate has B.Tech in CS (Meets requirement)',
      experience_match: true,
      experience_details: 'Candidate has 2 years (Meets requirement of 1 year)',
      fit_score: 74,
      eligibility_status: 'Eligible',
      breakdown: {
        skills_score: 60,
        education_score: 100,
        experience_score: 100,
        projects_score: 60,
        weights_used: DEFAULT_WEIGHTS
      },
      screening_date: '2026-09-14'
    }
  ];

  const interviews: Interview[] = [
    {
      interview_id: 'INT_001',
      application_id: 'APP_002',
      company_id: 'TCS001',
      company_name: 'TCS (Tata Consultancy Services)',
      candidate_id: 'CAN_102',
      candidate_name: 'Priya Sharma',
      job_title: 'Senior Frontend Developer (React/TypeScript)',
      interview_date: '2026-10-05',
      interview_time: '14:30 IST',
      interview_type: 'Technical',
      status: 'Scheduled',
      notes: 'Focus on React performance, custom hook design, and enterprise state management architecture.',
      meeting_link: 'https://meet.google.com/tcs-rec-921',
      created_at: '2026-09-15'
    }
  ];

  const notifications: Notification[] = [
    {
      notification_id: 'NOTIF_001',
      user_id: 'CAN_101',
      user_type: 'candidate',
      message: 'Your application for Full Stack Software Engineer at Infosys has been shortlisted!',
      created_at: '2026-09-13',
      read_status: false,
      type: 'status_update'
    },
    {
      notification_id: 'NOTIF_002',
      user_id: 'CAN_102',
      user_type: 'candidate',
      message: 'Interview scheduled: Senior Frontend Developer at TCS on 2026-10-05 at 14:30 IST.',
      created_at: '2026-09-15',
      read_status: false,
      type: 'interview'
    },
    {
      notification_id: 'NOTIF_003',
      user_id: 'HR_INF_01',
      user_type: 'hr',
      message: 'New application received from Rahul Kumar for Full Stack Software Engineer (Fit Score: 86%).',
      created_at: '2026-09-12',
      read_status: true,
      type: 'application'
    }
  ];

  const company_weights: Record<string, ScreeningWeights> = {
    INF001: { ...DEFAULT_WEIGHTS },
    TCS001: { ...DEFAULT_WEIGHTS },
    WIP001: { ...DEFAULT_WEIGHTS },
    ACC001: { ...DEFAULT_WEIGHTS },
    HCL001: { ...DEFAULT_WEIGHTS },
    TM001: { ...DEFAULT_WEIGHTS }
  };

  return {
    companies,
    hr_users,
    candidates,
    jobs,
    resumes,
    applications,
    screening_results,
    interviews,
    notifications,
    company_weights
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, falling back to seed data:', err);
    }
    const seed = generateSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // --- Companies & HR Users ---
  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public getCompany(companyId: string): Company | undefined {
    return this.data.companies.find((c) => c.company_id === companyId);
  }

  public updateCompany(companyId: string, updates: Partial<Company>): Company | null {
    const idx = this.data.companies.findIndex((c) => c.company_id === companyId);
    if (idx === -1) return null;
    this.data.companies[idx] = { ...this.data.companies[idx], ...updates };
    this.saveData();
    return this.data.companies[idx];
  }

  public getHRUserByEmail(email: string): HRUser | undefined {
    return this.data.hr_users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getHRUserById(hrId: string): HRUser | undefined {
    return this.data.hr_users.find((u) => u.hr_id === hrId);
  }

  public getHRUsers(): HRUser[] {
    return this.data.hr_users;
  }

  // --- Candidates ---
  public getCandidates(): Candidate[] {
    return this.data.candidates;
  }

  public getCandidateById(candidateId: string): Candidate | undefined {
    return this.data.candidates.find((c) => c.candidate_id === candidateId);
  }

  public getCandidateByEmail(email: string): Candidate | undefined {
    return this.data.candidates.find((c) => c.email.toLowerCase() === email.toLowerCase());
  }

  public createCandidate(candidate: Candidate): Candidate {
    this.data.candidates.push(candidate);
    this.saveData();
    return candidate;
  }

  public updateCandidate(candidateId: string, updates: Partial<Candidate>): Candidate | null {
    const idx = this.data.candidates.findIndex((c) => c.candidate_id === candidateId);
    if (idx === -1) return null;
    this.data.candidates[idx] = { ...this.data.candidates[idx], ...updates };
    this.saveData();
    return this.data.candidates[idx];
  }

  // --- Jobs (Strict Isolation) ---
  public getAllActiveJobs(): Job[] {
    return this.data.jobs.filter((j) => j.status === 'Active');
  }

  public getAllJobs(): Job[] {
    return this.data.jobs;
  }

  public getJobById(jobId: string): Job | undefined {
    return this.data.jobs.find((j) => j.job_id === jobId);
  }

  public getJobsByCompany(companyId: string): Job[] {
    return this.data.jobs.filter((j) => j.company_id === companyId);
  }

  public createJob(job: Job): Job {
    this.data.jobs.unshift(job);
    this.saveData();
    return job;
  }

  public updateJob(jobId: string, companyId: string, updates: Partial<Job>): Job | null {
    const idx = this.data.jobs.findIndex((j) => j.job_id === jobId && j.company_id === companyId);
    if (idx === -1) return null;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
    this.saveData();
    return this.data.jobs[idx];
  }

  public deleteJob(jobId: string, companyId: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => !(j.job_id === jobId && j.company_id === companyId));
    if (this.data.jobs.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Resumes ---
  public getCandidateResumes(candidateId: string): Resume[] {
    return this.data.resumes.filter((r) => r.candidate_id === candidateId);
  }

  public getResumeById(resumeId: string): Resume | undefined {
    return this.data.resumes.find((r) => r.resume_id === resumeId);
  }

  public createResume(resume: Resume): Resume {
    this.data.resumes.unshift(resume);
    this.saveData();
    return resume;
  }

  // --- Applications (Strict Isolation) ---
  public getApplicationsByCompany(companyId: string): Application[] {
    return this.data.applications.filter((a) => a.company_id === companyId);
  }

  public getApplicationsByCandidate(candidateId: string): Application[] {
    return this.data.applications.filter((a) => a.candidate_id === candidateId);
  }

  public getApplicationById(applicationId: string): Application | undefined {
    return this.data.applications.find((a) => a.application_id === applicationId);
  }

  public createApplication(app: Application): Application {
    this.data.applications.unshift(app);
    this.saveData();
    return app;
  }

  public updateApplicationStatus(
    applicationId: string,
    companyId: string,
    status: Application['application_status']
  ): Application | null {
    const idx = this.data.applications.findIndex(
      (a) => a.application_id === applicationId && a.company_id === companyId
    );
    if (idx === -1) return null;
    this.data.applications[idx].application_status = status;
    this.saveData();
    return this.data.applications[idx];
  }

  // --- Screening Results ---
  public createScreeningResult(result: ScreeningResult): ScreeningResult {
    this.data.screening_results.unshift(result);
    this.saveData();
    return result;
  }

  public getScreeningResultById(screeningId: string): ScreeningResult | undefined {
    return this.data.screening_results.find((s) => s.screening_id === screeningId);
  }

  public getScreeningResultByApplication(applicationId: string): ScreeningResult | undefined {
    return this.data.screening_results.find((s) => s.application_id === applicationId);
  }

  // --- Interviews (Strict Isolation) ---
  public getInterviewsByCompany(companyId: string): Interview[] {
    return this.data.interviews.filter((i) => i.company_id === companyId);
  }

  public getInterviewsByCandidate(candidateId: string): Interview[] {
    return this.data.interviews.filter((i) => i.candidate_id === candidateId);
  }

  public createInterview(interview: Interview): Interview {
    this.data.interviews.unshift(interview);
    this.saveData();
    return interview;
  }

  public updateInterviewStatus(
    interviewId: string,
    companyId: string,
    status: Interview['status']
  ): Interview | null {
    const idx = this.data.interviews.findIndex(
      (i) => i.interview_id === interviewId && i.company_id === companyId
    );
    if (idx === -1) return null;
    this.data.interviews[idx].status = status;
    this.saveData();
    return this.data.interviews[idx];
  }

  // --- Notifications ---
  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.user_id === userId);
  }

  public createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  public markNotificationAsRead(notificationId: string, userId: string): boolean {
    const notif = this.data.notifications.find(
      (n) => n.notification_id === notificationId && n.user_id === userId
    );
    if (notif) {
      notif.read_status = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Company Screening Weights ---
  public getCompanyWeights(companyId: string): ScreeningWeights {
    return this.data.company_weights[companyId] || { ...DEFAULT_WEIGHTS };
  }

  public setCompanyWeights(companyId: string, weights: ScreeningWeights): ScreeningWeights {
    this.data.company_weights[companyId] = weights;
    this.saveData();
    return weights;
  }

  // Reset database to initial seed (useful for testing or demo reset)
  public resetToSeed(): DatabaseSchema {
    this.data = generateSeedData();
    this.saveData();
    return this.data;
  }
}

export const db = new DatabaseManager();
