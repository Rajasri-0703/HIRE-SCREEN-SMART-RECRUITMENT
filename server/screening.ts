import { GoogleGenAI } from '@google/genai';
import { Job, Resume, ScreeningResult, ScreeningWeights } from '../src/types/index';

// Canonical synonym dictionary for technology and skill matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  python: ['python', 'python3', 'py', 'django', 'fastapi', 'flask'],
  java: ['java', 'core java', 'j2ee', 'spring', 'spring boot'],
  sql: ['sql', 'mysql', 'postgresql', 'postgres', 'relational database', 'sqlite'],
  react: ['react', 'react.js', 'reactjs', 'react native', 'next.js', 'nextjs'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js', 'es6', 'ecmascript'],
  'node.js': ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
  aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloud'],
  docker: ['docker', 'container', 'containers', 'docker compose'],
  kubernetes: ['kubernetes', 'k8s', 'orchestration'],
  'ci/cd': ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci'],
  git: ['git', 'github', 'version control', 'gitlab'],
  redux: ['redux', 'redux toolkit', 'rtk'],
  'tailwind css': ['tailwind', 'tailwindcss', 'tailwind css'],
  'rest apis': ['rest', 'restful', 'rest api', 'rest apis', 'api development'],
  'microservices': ['microservices', 'microservice architecture', 'distributed systems'],
  kafka: ['kafka', 'apache kafka', 'message broker'],
  selenium: ['selenium', 'automation testing', 'test automation', 'playwright', 'cypress'],
  'automation testing': ['automation testing', 'qa automation', 'selenium', 'playwright', 'unit testing'],
  pandas: ['pandas', 'numpy', 'scipy', 'data analysis', 'etl'],
  'data analysis': ['data analysis', 'analytics', 'tableau', 'power bi', 'pandas'],
  tableau: ['tableau', 'powerbi', 'power bi', 'looker', 'bi tools'],
  'c++': ['c++', 'cpp', 'embedded c', 'c/c++'],
  linux: ['linux', 'unix', 'ubuntu', 'bash', 'shell scripting'],
  'network security': ['network security', 'cybersecurity', 'siem', 'soc', 'firewalls', 'wireshark']
};

function normalizeSkill(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9#+.]/g, '').trim();
}

export function checkSkillMatch(requiredSkill: string, candidateSkills: string[], resumeText: string): boolean {
  const normReq = normalizeSkill(requiredSkill);
  const textLower = resumeText.toLowerCase();

  // 1. Direct match in candidate's listed skills
  for (const s of candidateSkills) {
    if (normalizeSkill(s) === normReq || normalizeSkill(s).includes(normReq) || normReq.includes(normalizeSkill(s))) {
      return true;
    }
  }

  // 2. Direct match in resume raw text
  if (textLower.includes(requiredSkill.toLowerCase()) || textLower.includes(normReq)) {
    return true;
  }

  // 3. Synonym dictionary match
  const synonyms = SKILL_SYNONYMS[requiredSkill.toLowerCase()];
  if (synonyms) {
    for (const syn of synonyms) {
      if (textLower.includes(syn.toLowerCase())) return true;
      for (const s of candidateSkills) {
        if (s.toLowerCase().includes(syn.toLowerCase())) return true;
      }
    }
  }

  return false;
}

export async function runScreeningEngine(
  job: Job,
  resume: Resume,
  weights: ScreeningWeights
): Promise<ScreeningResult> {
  const requiredSkills = job.required_skills || [];
  const candidateSkills = resume.parsed_skills || [];
  const resumeText = resume.extracted_text || '';

  // 1. Skills Matching
  const matching_skills: string[] = [];
  const missing_skills: string[] = [];

  for (const req of requiredSkills) {
    if (checkSkillMatch(req, candidateSkills, resumeText)) {
      matching_skills.push(req);
    } else {
      missing_skills.push(req);
    }
  }

  const skills_score = requiredSkills.length > 0
    ? Math.round((matching_skills.length / requiredSkills.length) * 100)
    : 100;

  // 2. Education Matching
  const reqEdu = (job.education_requirement || '').toLowerCase();
  const candEdu = (resume.parsed_education || '').toLowerCase();
  let education_match = true;
  let education_score = 100;

  if (reqEdu.includes('b.tech') || reqEdu.includes('mca') || reqEdu.includes('b.e')) {
    if (candEdu.includes('b.tech') || candEdu.includes('b.e') || candEdu.includes('mca') || candEdu.includes('m.tech') || candEdu.includes('computer science') || candEdu.includes('information technology')) {
      education_match = true;
      education_score = 100;
    } else if (candEdu.includes('b.sc') || candEdu.includes('bca')) {
      education_match = true;
      education_score = 80;
    } else {
      education_match = false;
      education_score = 50;
    }
  }

  // 3. Experience Matching
  const candExp = resume.parsed_experience_years || 0;
  const reqExp = job.experience_requirement || 0;
  let experience_match = candExp >= reqExp;
  let experience_score = 100;

  if (reqExp > 0) {
    if (candExp >= reqExp) {
      experience_score = 100;
    } else {
      experience_score = Math.max(30, Math.round((candExp / reqExp) * 100));
    }
  }

  // 4. Projects & Certifications
  const projCount = (resume.parsed_projects || []).length;
  const certCount = (resume.parsed_certifications || []).length;
  const projects_score = Math.min(100, Math.max(40, (projCount * 30) + (certCount * 25)));

  // 5. Composite Rule-Based Fit Score Calculation
  const totalWeight = weights.skills_weight + weights.education_weight + weights.experience_weight + weights.projects_weight;
  const rawFitScore = (
    (skills_score * weights.skills_weight) +
    (education_score * weights.education_weight) +
    (experience_score * weights.experience_weight) +
    (projects_score * weights.projects_weight)
  ) / (totalWeight || 100);

  const fit_score = Math.min(100, Math.max(10, Math.round(rawFitScore)));

  // Eligibility
  let eligibility_status: 'Eligible' | 'Review Needed' | 'Not Eligible' = 'Not Eligible';
  if (fit_score >= weights.min_passing_score) {
    eligibility_status = 'Eligible';
  } else if (fit_score >= Math.max(45, weights.min_passing_score - 20)) {
    eligibility_status = 'Review Needed';
  }

  const result: ScreeningResult = {
    screening_id: 'SCR_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    job_id: job.job_id,
    candidate_id: resume.candidate_id,
    candidate_name: 'Applicant',
    matching_skills,
    missing_skills,
    education_match,
    education_details: education_match
      ? `Candidate qualification (${resume.parsed_education}) satisfies job criteria (${job.education_requirement})`
      : `Candidate qualification (${resume.parsed_education}) does not fully match required (${job.education_requirement})`,
    experience_match,
    experience_details: experience_match
      ? `Candidate has ${candExp} year(s) of verified experience (Required: ${reqExp} year(s))`
      : `Candidate has ${candExp} year(s) of experience, which is below the required ${reqExp} year(s)`,
    fit_score,
    eligibility_status,
    breakdown: {
      skills_score,
      education_score,
      experience_score,
      projects_score,
      weights_used: weights
    },
    screening_date: new Date().toISOString().split('T')[0]
  };

  // Optional: Gemini AI Semantic Keyword Scoring
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are an enterprise HR recruitment intelligence engine. Evaluate this candidate resume against the job description for automated screening keyword matching.
Job Title: ${job.title}
Job Company: ${job.company_name}
Job Description: ${job.description}
Required Skills: ${job.required_skills.join(', ')}
Required Experience: ${job.experience_requirement} years

Resume Content:
${resume.extracted_text.slice(0, 3000)}

Return a strict JSON object with these keys:
{
  "keyword_match_summary": "1-2 sentences summarizing keyword coverage and tech stack compatibility",
  "strengths": ["3 key strengths of the applicant"],
  "potential_gaps": ["1-2 potential gaps or areas to clarify"],
  "suggested_interview_questions": ["2 specific technical questions tailored to this candidate resume and job requirements"],
  "recommendation": "Short 1-sentence recommendation for the HR recruiter"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        result.ai_analysis = {
          keyword_match_summary: parsed.keyword_match_summary || 'Semantic keyword analysis completed.',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Solid foundational alignment with role requirements'],
          potential_gaps: Array.isArray(parsed.potential_gaps) ? parsed.potential_gaps : ['Verify production scale exposure during interview'],
          suggested_interview_questions: Array.isArray(parsed.suggested_interview_questions) ? parsed.suggested_interview_questions : ['Walk through a recent production challenge in your stack.'],
          recommendation: parsed.recommendation || 'Proceed with HR review.'
        };
      }
    } catch (err) {
      console.warn('Gemini API call optional enhancement skipped:', (err as Error).message);
      // Fallback AI heuristic insights
      result.ai_analysis = {
        keyword_match_summary: `Rule-based keyword matching verified ${matching_skills.length} of ${requiredSkills.length} required technology proficiencies.`,
        strengths: [
          `Demonstrated proficiency in: ${matching_skills.slice(0, 3).join(', ') || 'Core fundamentals'}`,
          `Educational profile matches technical recruitment benchmarks`,
          `Applied practical experience in modern software toolchains`
        ],
        potential_gaps: missing_skills.length > 0
          ? [`Secondary keywords not explicitly detected: ${missing_skills.join(', ')}`]
          : ['No critical keyword gaps identified'],
        suggested_interview_questions: [
          `Can you describe how you architected your recent projects using ${matching_skills[0] || 'your core stack'}?`,
          `How do you approach learning and integrating missing tools like ${missing_skills[0] || 'new cloud services'}?`
        ],
        recommendation: fit_score >= 70
          ? 'Recommended for technical screening interview.'
          : 'Further review advised to evaluate transferable skills.'
      };
    }
  } else {
    // Local fallback heuristic insights
    result.ai_analysis = {
      keyword_match_summary: `Automated rule-based keyword matching verified ${matching_skills.length} of ${requiredSkills.length} required technology proficiencies.`,
      strengths: [
        `Demonstrated proficiency in: ${matching_skills.slice(0, 3).join(', ') || 'Core fundamentals'}`,
        `Education and background align with technical standards`,
        `Project experience demonstrates hands-on problem solving`
      ],
      potential_gaps: missing_skills.length > 0
        ? [`Keywords not explicitly detected in resume: ${missing_skills.join(', ')}`]
        : ['No major technical keyword gaps detected'],
      suggested_interview_questions: [
        `Can you describe how you architected your recent projects using ${matching_skills[0] || 'your core stack'}?`,
        `How do you approach learning and integrating tools like ${missing_skills[0] || 'new cloud platforms'}?`
      ],
      recommendation: fit_score >= 70
        ? 'Recommended for technical screening interview.'
        : 'Review advised to evaluate transferable skills.'
    };
  }

  return result;
}
