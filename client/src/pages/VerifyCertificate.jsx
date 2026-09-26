import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Award, CheckCircle, XCircle, Calendar, Building2, Clock } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/certificates/verify/${certificateId}`)
      .then(r => { setCert(r.data.certificate); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [certificateId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0c29 60%, #1a1040 100%)' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IC</span>
            </div>
            <span className="font-bold text-white">InternConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Certificate Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Scan QR or use ID to verify authenticity</p>
        </div>

        {loading ? (
          <div className="glass-card p-16 text-center">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 text-sm">Verifying certificate...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-10 text-center">
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Certificate</h2>
            <p className="text-gray-400 text-sm">This certificate ID could not be verified. It may be invalid or expired.</p>
            <div className="mt-6 p-3 rounded-lg bg-white/5 text-xs text-gray-500 font-mono break-all">{certificateId}</div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-emerald-600/15 to-primary-600/10 text-center border-b border-white/5">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">Certificate Verified ✓</h2>
              <p className="text-emerald-400 text-sm mt-1">This is a valid InternConnect certificate</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Student Name</p>
                <p className="text-lg font-bold text-white">{cert.studentName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Internship</p>
                  <p className="text-sm text-gray-200">{cert.internshipTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Company</p>
                  <p className="text-sm text-gray-200 flex items-center gap-1"><Building2 size={13} />{cert.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm text-gray-200 flex items-center gap-1"><Clock size={13} />{cert.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issued On</p>
                  <p className="text-sm text-gray-200 flex items-center gap-1"><Calendar size={13} />{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-xs font-mono text-gray-400 break-all">{cert.certificateId}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-6">
          Powered by <Link to="/" className="text-primary-400">InternConnect</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
