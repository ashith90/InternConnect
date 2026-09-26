import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resubmitDocuments, clearError, clearRegisterSuccess } from '../features/auth/authSlice';
import {
  Upload, X, FileText, Image, CheckCircle2, ArrowRight,
  Mail, AlertTriangle, Clock, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResubmitDocuments = () => {
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector(s => s.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error]);

  useEffect(() => {
    return () => { dispatch(clearRegisterSuccess()); };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    if (files.length === 0) return toast.error('Please upload at least one verification document');

    const formData = new FormData();
    formData.append('email', email);
    files.forEach(f => formData.append('documents', f));
    dispatch(resubmitDocuments(formData));
  };

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

  // --- Success Screen ---
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0c29 60%, #1a1040 100%)' }}>
        <div className="w-full max-w-md text-center">
          <div className="glass-card p-10 rounded-2xl border border-primary-500/30">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary-600/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-2xl">
                <CheckCircle2 size={44} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Documents Resubmitted!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Your new documents have been submitted for review. An admin will verify them shortly.
            </p>
            <div className="space-y-3 text-left mb-8">
              {[
                { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Documents Resubmitted', sub: 'Your files have been received' },
                { icon: Clock, color: 'text-amber-400', bg: 'bg-white/3 border-white/10', label: 'Under Admin Review', sub: 'Usually takes 24–48 hours' },
                { icon: ShieldCheck, color: 'text-primary-400', bg: 'bg-white/3 border-white/10', label: 'Account Activation', sub: "You'll receive access after approval" },
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
            <Link to="/login"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium">
              <ArrowRight size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0c29 60%, #1a1040 100%)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/50">
            <span className="text-white font-black text-2xl">IC</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Resubmit Documents</h1>
          <p className="text-gray-400 text-sm">
            Your account was rejected. Upload corrected documents to reapply for verification.
          </p>
        </div>

        {/* Rejection notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-6">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Make sure to upload clear, legible documents. Blurry or incomplete documents may lead to another rejection.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Your Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10" placeholder="The email you registered with" />
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Updated Verification Documents <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                For students: college ID, enrollment letter, or student certificate.<br />
                For companies: registration certificate, GST certificate, or trade license.<br />
                (PDF/JPG/PNG, max 5MB each, up to 3 files)
              </p>

              {/* Drop Zone */}
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('resub-upload').click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary-500 bg-primary-600/10'
                    : 'border-white/20 bg-white/3 hover:border-primary-500/60 hover:bg-primary-600/5'
                }`}>
                <input
                  id="resub-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => handleFileChange(e.target.files)}
                />
                <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-primary-400' : 'text-gray-500'}`} />
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
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Resubmit for Verification</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Try logging in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResubmitDocuments;
