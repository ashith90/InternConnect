import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError, clearLoginVerification } from '../features/auth/authSlice';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Clock, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, loginVerificationStatus, loginVerificationNote } = useSelector(s => s.auth);

  // Track whether a login was just submitted — only redirect on a fresh login, not on stale localStorage
  const justSubmitted = useRef(false);

  useEffect(() => {
    if (user && justSubmitted.current) {
      const paths = { student: '/student/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' };
      navigate(paths[user.role] || '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only show toast for non-verification errors
    if (error && !loginVerificationStatus) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, loginVerificationStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    justSubmitted.current = true;
    dispatch(clearLoginVerification());
    dispatch(login(form));
  };

  const demoAccounts = [
    { label: 'Student', email: 'student@demo.com', password: 'Student@123', color: 'emerald' },
    { label: 'Admin', email: 'admin@internconnect.com', password: 'Admin@123', color: 'amber' },
    { label: 'Company', email: 'techcorp@demo.com', password: 'Company@123', color: 'blue' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: '#111111', borderRight: '1px solid #1f1f1f' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-xl bg-violet-700 flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">IC</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              InternConnect
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-md">
              The platform connecting students with opportunities, companies with talent, and helping you build a verified career portfolio.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[['500+', 'Students'], ['100+', 'Companies'], ['1K+', 'Internships']].map(([num, label]) => (
                <div key={label} className="glass-card p-4 text-center">
                  <div className="text-xl font-bold text-white">{num}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to your InternConnect account</p>
          </div>

          {/* Verification status banners */}
          {loginVerificationStatus === 'pending' && (
            <div className="mb-5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/8">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">Account Under Review</p>
                  <p className="text-xs text-amber-300/70 leading-relaxed">
                    Your registration documents are being reviewed by an admin. You'll be able to log in once your account is approved (usually 24–48 hours).
                  </p>
                </div>
              </div>
            </div>
          )}

          {loginVerificationStatus === 'rejected' && (
            <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/8">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300 mb-1">Account Verification Rejected</p>
                  {loginVerificationNote && (
                    <p className="text-xs text-red-300/70 mb-2 leading-relaxed">
                      <strong>Reason:</strong> {loginVerificationNote}
                    </p>
                  )}
                  <p className="text-xs text-red-300/70 mb-3">
                    Please upload corrected documents to reactivate your registration.
                  </p>
                  <Link to="/resubmit-documents"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors">
                    <RefreshCw size={12} /> Resubmit Documents
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" style={{ paddingLeft: '2.75rem' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/3">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wider">Quick Demo Access</p>
            <div className="space-y-2">
              {demoAccounts.map(({ label, email, password, color }) => (
                <button key={label}
                  onClick={() => setForm({ email, password })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs border border-${color}-500/20 bg-${color}-500/5 hover:bg-${color}-500/10 transition-colors`}>
                  <span className={`font-semibold text-${color}-400`}>{label}</span>
                  <span className="text-gray-500 ml-2">{email}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 justify-center">
              <ShieldCheck size={12} className="text-emerald-400" />
              <p className="text-xs text-gray-600">Demo accounts are pre-approved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
