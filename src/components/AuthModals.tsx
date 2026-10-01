import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Building2, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'candidate-login' | 'candidate-register' | 'hr-login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'candidate-login'
}) => {
  const { loginCandidate, registerCandidate, loginHR, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'candidate-login' | 'candidate-register' | 'hr-login'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Candidate Login state
  const [candIdentifier, setCandIdentifier] = useState('');
  const [candPassword, setCandPassword] = useState('');

  // HR Login state
  const [hrCompanyId, setHrCompanyId] = useState('INF001');
  const [hrEmail, setHrEmail] = useState('hr@infosys.com');
  const [hrPassword, setHrPassword] = useState('password123');

  // Candidate Registration state
  const [regData, setRegData] = useState({
    name: '',
    candidate_id: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    education: 'B.Tech in Computer Science',
    graduation_year: '2024',
    skills: 'Python, SQL, React, Git',
    experience_years: '2',
    preferred_role: 'Software Developer',
    preferred_location: 'Bengaluru'
  });

  if (!isOpen) return null;

  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginCandidate(candIdentifier, candPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginHR(hrCompanyId, hrEmail, hrPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'HR Login failed. Check Company ID and credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerCandidate(regData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectCompanyPreset = (cid: string, email: string) => {
    setHrCompanyId(cid);
    setHrEmail(email);
    setHrPassword('password123');
    setError(null);
  };

  const triggerQuickDemo = async (type: 'candidate' | 'hr', id: string) => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin(type, id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-6">
          <button
            onClick={() => {
              setMode('candidate-login');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              mode === 'candidate-login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Candidate Sign In
          </button>
          <button
            onClick={() => {
              setMode('candidate-register');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              mode === 'candidate-register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Candidate Register
          </button>
          <button
            onClick={() => {
              setMode('hr-login');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              mode === 'hr-login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HR Recruiter Portal
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-3 mb-5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs md:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: CANDIDATE LOGIN */}
        {mode === 'candidate-login' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Candidate Sign In
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Access your applications, upload resumes, and view live screening fit scores.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="p-3 mb-5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                ⚡ 1-Click Demo Profiles (College Evaluation)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => triggerQuickDemo('candidate', 'CAN_101')}
                  className="px-3 py-2 text-xs text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-200">Rahul Kumar</div>
                    <div className="text-slate-400 text-[11px]">Software Dev · 2 yrs</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => triggerQuickDemo('candidate', 'CAN_102')}
                  className="px-3 py-2 text-xs text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-200">Priya Sharma</div>
                    <div className="text-slate-400 text-[11px]">Frontend React · 3 yrs</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCandidateLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Candidate ID or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAN_101 or rahul.kumar@gmail.com"
                  value={candIdentifier}
                  onChange={(e) => setCandIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Password: password123')}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={candPassword}
                  onChange={(e) => setCandPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In as Candidate'}
              </button>
            </form>

            <div className="text-center mt-5 text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('candidate-register')}
                className="text-indigo-400 hover:underline font-medium"
              >
                Create Candidate Account
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: CANDIDATE REGISTRATION */}
        {mode === 'candidate-register' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Candidate Registration
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Create your student/professional profile to start receiving automated fit scores.
              </p>
            </div>

            <form onSubmit={handleCandidateRegister} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Candidate ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank (e.g. CAN_782)"
                    value={regData.candidate_id}
                    onChange={(e) => setRegData({ ...regData, candidate_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India"
                    value={regData.location}
                    onChange={(e) => setRegData({ ...regData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech in Computer Science"
                    value={regData.education}
                    onChange={(e) => setRegData({ ...regData, education: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={regData.graduation_year}
                    onChange={(e) => setRegData({ ...regData, graduation_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, SQL, Java, React, Git, AWS"
                  value={regData.skills}
                  onChange={(e) => setRegData({ ...regData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2"
                    value={regData.experience_years}
                    onChange={(e) => setRegData({ ...regData, experience_years: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Preferred Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={regData.preferred_role}
                    onChange={(e) => setRegData({ ...regData, preferred_role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Preferred Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Hybrid"
                    value={regData.preferred_location}
                    onChange={(e) => setRegData({ ...regData, preferred_location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors mt-3"
              >
                {loading ? 'Creating Profile...' : 'Complete Candidate Registration'}
              </button>
            </form>
          </div>
        )}

        {/* MODE 3: HR LOGIN (Strict Multi-Company Requirement) */}
        {mode === 'hr-login' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                HR Recruiter Sign In
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Multi-company enterprise isolation: each HR account accesses only their company's data.
              </p>
            </div>

            {/* Strict Isolation Notice */}
            <div className="flex items-center gap-2 p-2.5 mb-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-indigo-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Backend data isolation active: Infosys HR sees only Infosys jobs & candidates, TCS HR sees only TCS data.
              </span>
            </div>

            {/* Quick Demo Company Switcher */}
            <div className="p-3 mb-5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Demo Company Account:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { cid: 'INF001', name: 'Infosys', email: 'hr@infosys.com' },
                  { cid: 'TCS001', name: 'TCS', email: 'hr@tcs.com' },
                  { cid: 'WIP001', name: 'Wipro', email: 'hr@wipro.com' },
                  { cid: 'ACC001', name: 'Accenture', email: 'hr@accenture.com' },
                  { cid: 'HCL001', name: 'HCLTech', email: 'hr@hcltech.com' },
                  { cid: 'TM001', name: 'Tech Mahindra', email: 'hr@techmahindra.com' }
                ].map((co) => (
                  <button
                    key={co.cid}
                    type="button"
                    onClick={() => selectCompanyPreset(co.cid, co.email)}
                    className={`p-2 text-left rounded-lg text-xs border transition-all ${
                      hrCompanyId === co.cid
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold truncate">{co.name}</div>
                    <div className="text-[10px] text-slate-400">{co.cid}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleHRLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INF001, TCS001, WIP001"
                  value={hrCompanyId}
                  onChange={(e) => setHrCompanyId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  HR Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="hr@company.com"
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo HR Password: password123')}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={hrPassword}
                  onChange={(e) => setHrPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Authenticating...' : `Sign In to ${hrCompanyId} HR Portal`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
