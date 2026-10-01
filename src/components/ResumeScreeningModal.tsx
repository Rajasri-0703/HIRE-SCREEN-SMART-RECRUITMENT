import React, { useState, useEffect } from 'react';
import { Job, Resume, ScreeningResult } from '../types/index';
import { api } from '../services/api';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Check,
  Cpu,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface ResumeScreeningModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted: () => void;
}

export const ResumeScreeningModal: React.FC<ResumeScreeningModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplicationSubmitted
}) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'select' | 'upload' | 'sample'>('select');

  // New file upload state
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(false);

  // Screening state
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load candidate's existing resumes on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setScreeningResult(null);
      setUploadSuccessMessage(false);
      api.getCandidateResumes()
        .then((res) => {
          setResumes(res.resumes);
          if (res.resumes.length > 0) {
            setSelectedResumeId(res.resumes[0].resume_id);
            setUploadMode('select');
          } else {
            setUploadMode('sample');
          }
        })
        .catch((err) => console.error('Failed to load resumes:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle file select from desktop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || `Extracted text from ${file.name}`);
      setUploadSuccessMessage(true);
    };
    reader.readAsText(file);
  };

  // Load a rich sample technical resume template
  const loadSampleResume = (roleType: 'fullstack' | 'frontend' | 'fresher') => {
    let name = '';
    let text = '';
    if (roleType === 'fullstack') {
      name = 'Sample_FullStack_Engineer_Resume.pdf';
      text = `FULL STACK SOFTWARE ENGINEER
Email: candidate.tech@domain.com | Phone: +91 98765 00000 | Location: Bengaluru
Summary:
Passionate Software Engineer with 2.5 years of experience architecting microservices with Python, Java, SQL, and React frontends. Familiar with AWS cloud deployments and Git version control.

TECHNICAL SKILLS:
- Languages: Python, Java, SQL, JavaScript, HTML, CSS
- Frameworks: React, FastAPI, Spring Boot, Node.js
- Cloud & DB: AWS, PostgreSQL, MySQL, Docker, Git

EDUCATION:
B.Tech in Computer Science and Engineering (2023) - 8.8 CGPA

EXPERIENCE:
Software Engineer | Digital Edge (2023 - Present) - 2.5 years
- Designed React dashboards and integrated RESTful APIs with Python FastAPI.
- Optimized relational database queries in PostgreSQL, improving transaction speeds.

PROJECTS:
- Enterprise Resource Cloud Platform: React + Python + PostgreSQL.
- Distributed Event Pipeline: Java + Kafka message broker.`;
    } else if (roleType === 'frontend') {
      name = 'Sample_Frontend_React_Specialist.pdf';
      text = `SENIOR FRONTEND DEVELOPER
Email: frontend.expert@domain.com | Phone: +91 98111 22222 | Location: Pune
Summary:
Frontend Specialist with 3.5 years of hands-on experience building high-performance web applications using React, TypeScript, Redux, and Tailwind CSS.

SKILLS:
React, TypeScript, Redux, Tailwind CSS, REST APIs, Git, Next.js, HTML5, CSS3, Jest

EDUCATION:
B.E. in Information Technology (2022)

EXPERIENCE:
Frontend Engineer | Tech Matrix (2022 - Present) - 3.5 years
- Built responsive UI components using React and Tailwind CSS.
- Implemented state management using Redux Toolkit and React Query.`;
    } else {
      name = 'Sample_Fresher_Graduate_Resume.docx';
      text = `JUNIOR SOFTWARE DEVELOPER
Email: fresher.grad@domain.com | Location: Hyderabad
Summary:
Recent Computer Science graduate with strong foundational knowledge in Python, SQL, C++, Data Structures and Algorithms.

SKILLS:
Python, SQL, C++, Git, HTML, CSS, Problem Solving

EDUCATION:
B.Tech in Computer Science (2025) - CGPA 8.4

PROJECTS:
- Student Record Management System: Python & SQLite
- Algorithm Visualizer Web App: JavaScript & HTML5`;
    }

    setFileName(name);
    setResumeText(text);
    setUploadSuccessMessage(true);
  };

  // STEP 2: RUN SCREENING ENGINE
  const handleRunScreening = async () => {
    setIsScreening(true);
    setError(null);

    try {
      let payload: any = { job_id: job.job_id };

      if (uploadMode === 'select' && selectedResumeId) {
        payload.resume_id = selectedResumeId;
      } else {
        if (!resumeText.trim()) {
          throw new Error('Please upload or select a resume first');
        }

        // Upload resume first
        const uploadRes = await api.uploadResume({
          file_name: fileName || 'Uploaded_Resume.pdf',
          raw_text: resumeText
        });
        payload.resume_id = uploadRes.resume.resume_id;
        setSelectedResumeId(uploadRes.resume.resume_id);
      }

      const res = await api.screenResume(payload);
      setScreeningResult(res.screening);
    } catch (err: any) {
      setError(err.message || 'Screening failed. Please verify resume text.');
    } finally {
      setIsScreening(false);
    }
  };

  // STEP 3: SUBMIT APPLICATION
  const handleSubmitApplication = async () => {
    if (!screeningResult) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.applyForJob({
        job_id: job.job_id,
        resume_id: selectedResumeId,
        screening_data: screeningResult
      });
      onApplicationSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>{job.company_name}</span>
              <span>·</span>
              <span>{job.job_id}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{job.title}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Required Skills: {job.required_skills.join(', ')} · Exp: {job.experience_requirement} yr(s)
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: RESUME SELECTION / UPLOAD */}
        {!screeningResult && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Step 1: Select or Upload Your Resume
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-medium">
                {resumes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUploadMode('select')}
                    className={`py-2 px-3 rounded-lg transition-colors ${
                      uploadMode === 'select'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Saved Resumes ({resumes.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    uploadMode === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload File (PDF/DOCX)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('sample')}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    uploadMode === 'sample'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  1-Click Sample Resumes
                </button>
              </div>

              {/* Option A: Select Existing */}
              {uploadMode === 'select' && (
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <label
                      key={r.resume_id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedResumeId === r.resume_id
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <div>
                          <div className="text-sm font-semibold">{r.file_name}</div>
                          <div className="text-[11px] text-slate-400">
                            Uploaded {r.upload_date} · Skills: {r.parsed_skills.slice(0, 4).join(', ')}
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="selectedResume"
                        checked={selectedResumeId === r.resume_id}
                        onChange={() => setSelectedResumeId(r.resume_id)}
                        className="text-indigo-600 focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Option B: Upload PDF/DOCX/TXT */}
              {uploadMode === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center bg-slate-950/60">
                    <Upload className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
                    <div className="text-sm font-semibold text-white mb-1">
                      Choose PDF, DOCX or TXT resume
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      File text is parsed automatically for skills, education and experience.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>

                  {uploadSuccessMessage && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Resume uploaded and parsed successfully: <strong>{fileName}</strong></span>
                    </div>
                  )}

                  {resumeText && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Resume Text Content Preview (Editable)
                      </label>
                      <textarea
                        rows={4}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Option C: 1-Click Sample Resumes */}
              {uploadMode === 'sample' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 mb-2">
                    Quickly test how different applicant skill profiles score against <strong>{job.title}</strong>:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => loadSampleResume('fullstack')}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-white">Full Stack Engineer</div>
                      <div className="text-[11px] text-slate-400 mt-1">Python, Java, React, SQL, AWS · 2.5 yrs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleResume('frontend')}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-white">Frontend Specialist</div>
                      <div className="text-[11px] text-slate-400 mt-1">React, TypeScript, Redux, CSS · 3.5 yrs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleResume('fresher')}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-white">Fresh Graduate</div>
                      <div className="text-[11px] text-slate-400 mt-1">Python, SQL, Algorithms · 0 yrs</div>
                    </button>
                  </div>

                  {uploadSuccessMessage && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Loaded profile: <strong>{fileName}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Run Screening Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={isScreening || (!selectedResumeId && !resumeText)}
                onClick={handleRunScreening}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>{isScreening ? 'Processing Resume & Calculating Fit Score...' : 'Run Automated Resume Screening'}</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                * Fit score is dynamically calculated after resume ingestion based on skill keywords, education & experience.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 & 3: LIVE SCREENING RESULTS DISPLAY & SUBMIT */}
        {screeningResult && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Fit Score & Eligibility Banner */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Overall Fit Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold font-mono text-white tabular-nums">
                    {screeningResult.fit_score}%
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                      screeningResult.eligibility_status === 'Eligible'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : screeningResult.eligibility_status === 'Review Needed'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {screeningResult.eligibility_status}
                  </span>
                </div>
              </div>

              {/* Score Breakdown Bar */}
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Skills Match (50%)</span>
                  <span className="font-mono text-white">{screeningResult.breakdown.skills_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${screeningResult.breakdown.skills_score}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Experience Fit (20%)</span>
                  <span className="font-mono text-white">{screeningResult.breakdown.experience_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${screeningResult.breakdown.experience_score}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Education Fit (20%)</span>
                  <span className="font-mono text-white">{screeningResult.breakdown.education_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${screeningResult.breakdown.education_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Skills Comparison: Matching vs Missing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Matching Skills ({screeningResult.matching_skills.length})
                </div>
                {screeningResult.matching_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {screeningResult.matching_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No direct required skill matches detected.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  Missing Skills ({screeningResult.missing_skills.length})
                </div>
                {screeningResult.missing_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {screeningResult.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium"
                      >
                        • {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400">All required skills present!</p>
                )}
              </div>
            </div>

            {/* Education & Experience Match Details */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                {screeningResult.education_match ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-white">Education: </span>
                  <span className="text-slate-300">{screeningResult.education_details}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {screeningResult.experience_match ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-white">Experience: </span>
                  <span className="text-slate-300">{screeningResult.experience_details}</span>
                </div>
              </div>
            </div>

            {/* AI Keyword Insights Section */}
            {screeningResult.ai_analysis && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Automated Keyword Analysis
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {screeningResult.ai_analysis.keyword_match_summary}
                </p>
                {screeningResult.ai_analysis.recommendation && (
                  <div className="text-indigo-300 font-medium pt-1">
                    Recommendation: {screeningResult.ai_analysis.recommendation}
                  </div>
                )}
              </div>
            )}

            {/* Actions: Re-test with another resume or Submit Application */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={() => setScreeningResult(null)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                ← Test Another Resume
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitApplication}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
