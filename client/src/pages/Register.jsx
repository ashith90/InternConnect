import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError, clearRegisterSuccess } from '../features/auth/authSlice';
import {
  Eye, EyeOff, Mail, Lock, User, Building2, Phone, GraduationCap,
  ArrowRight, Upload, X, FileText, Image, CheckCircle2, Clock, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', college: '', companyName: '' });
  const [showPass, setShowPass] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, registerSuccess } = useSelector(s => s.auth);

  useEffect(() => {
    if (user) {
      const paths = { student: '/student/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' };
      navigate(paths[user.role] || '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error]);

  useEffect(() => {
    return () => { dispatch(clearRegisterSuccess()); };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (files.length === 0) return toast.error('Please upload at least one verification document');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('role', role);
    formData.append('phone', form.phone);
    if (role === 'student') formData.append('college', form.college);
    if (role === 'company') formData.append('companyName', form.companyName);
    files.forEach(f => formData.append('documents', f));

    dispatch(register(formData));
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleFileChange = (selectedFiles) => {
    const arr = Array.from(selectedFiles);
    const valid = arr.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        toast.error(`${f.name}: Only PDF, JPG, JPEG, PNG allowed`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: Max 5MB per file`);
        return false;
      }
      return true;
    });
    const combined = [...files, ...valid].slice(0, 3);
    setFiles(combined);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [files]);

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const getFileIcon = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ext === 'pdf' ? FileText : Image;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --- Pending Review Screen ---
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0c29 60%, #1a1040 100%)' }}>
        <div className="w-full max-w-md text-center">
          <div className="glass-card p-10 rounded-2xl border border-primary-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(15,12,41,0.8) 100%)' }}>
            {/* Animated success icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary-600/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-primary-900/50">
                <CheckCircle2 size={44} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-3">Documents Submitted!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Your registration is under review. An admin will verify your documents and approve your account shortly.
            </p>

            {/* Status timeline */}
            <div className="space-y-3 text-left mb-8">
              {[
                { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Documents Submitted', sub: 'Your files have been received' },
                { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Under Admin Review', sub: 'Usually takes 24–48 hours' },
                { icon: ShieldCheck, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/30', label: 'Account Activation', sub: "You'll receive access after approval" },
              ].map(({ icon: Icon, color, bg, label, sub }, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${i === 0 ? bg : 'bg-white/3 border-white/10'}`}>
                  <Icon size={20} className={i === 0 ? color : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-medium ${i === 0 ? 'text-white' : 'text-gray-500'}`}>{label}</p>
                    <p className="text-xs text-gray-600">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Link to="/login"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium">
                <ArrowRight size={16} /> Go to Login
              </Link>
              <p className="text-xs text-gray-600">
                Account rejected?{' '}
                <Link to="/resubmit-documents" className="text-primary-400 hover:text-primary-300">
                  Resubmit documents
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0c29 60%, #1a1040 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center">
          <div className="absolute top-32 left-16 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-16 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-900/50 animate-glow">
              <span className="text-white font-black text-3xl">IC</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-4">Join <span className="gradient-text">InternConnect</span></h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Start your journey today. Connect with top companies, track your growth, and earn certifications.
            </p>
            <div className="mt-10 space-y-3 text-left max-w-sm mx-auto">
              {[
                'Discover internship opportunities',
                'Track skills & progress',
                'Earn verified certificates',
                'Secure, verified community',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-400 text-xs">✓</span>
                  </div>
                  {t}
                </div>
              ))}
            </div>
            {/* Verification badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck size={14} />
              Verified accounts only — prevents scam listings
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-6">Choose your role and upload verification documents</p>

          {/* Role Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
            {[{ id: 'student', label: 'Student', icon: GraduationCap }, { id: 'company', label: 'Company', icon: Building2 }].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setRole(id); setFiles([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder={role === 'student' ? 'John Doe' : 'Contact Person'} />
              </div>
            </div>

            {/* Company Name (company only) */}
            {role === 'company' && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Company Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" required value={form.companyName} onChange={e => set('companyName', e.target.value)}
                    className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="TechCorp Inc." />
                </div>
              </div>
            )}

            {/* College (student only) */}
            {role === 'student' && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">College / University</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={form.college} onChange={e => set('college', e.target.value)}
                    className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="MIT, IIT Delhi..." />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="you@example.com" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="+91 9876543210" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="input-field pr-10" style={{ paddingLeft: '2.75rem' }} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Verification Documents <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {role === 'student'
                  ? 'Upload your college ID card, enrollment letter, or student certificate'
                  : 'Upload company registration certificate, GST certificate, or trade license'}
                {' '}(PDF/JPG/PNG, max 5MB each, up to 3 files)
              </p>

              {/* Drop Zone */}
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('doc-upload').click()}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary-500 bg-primary-600/10'
                    : 'border-white/20 bg-white/3 hover:border-primary-500/60 hover:bg-primary-600/5'
                }`}>
                <input
                  id="doc-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => handleFileChange(e.target.files)}
                />
                <Upload size={24} className={`mx-auto mb-2 ${dragOver ? 'text-primary-400' : 'text-gray-500'}`} />
                <p className="text-sm text-gray-400">
                  <span className="text-primary-400 font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-600 mt-1">PDF, JPG, JPEG, PNG</p>
              </div>

              {/* File Previews */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => {
                    const FileIcon = getFileIcon(f);
                    return (
                      <div key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                          <FileIcon size={16} className="text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{formatSize(f.size)}</p>
                        </div>
                        <button type="button" onClick={() => removeFile(i)}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {files.length === 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400/80">
                  <span>⚠</span>
                  <span>At least 1 document required for verification</span>
                </div>
              )}
            </div>

            {/* Verification Notice */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <ShieldCheck size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Your account will be reviewed by an admin before activation. This typically takes 24–48 hours. You won't be able to log in until approved.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Submit for Verification</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
