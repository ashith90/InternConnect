import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Award, Download, ExternalLink, BarChart2, ChevronDown, ChevronUp,
  Loader2, Star, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mini performance bar
const PerfBar = ({ label, value }) => {
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#7c3aed';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(to right, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
};

const Certificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/certificates/my')
      .then(r => { setCerts(r.data.certificates); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (id, name) => {
    setDownloading(id);
    try {
      // Use the authenticated API endpoint — it auto-regenerates the PDF
      // if the file is missing on disk (e.g. after server restart).
      const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });

      // Check if the response is actually an error JSON blob
      const contentType = res.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || 'Download failed');
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `InternConnect_Certificate_${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error(err.message || 'Download failed. Please try again.');
    }
    setDownloading(null);
  };

  const PERF_LABELS = {
    technicalSkills: 'Technical Skills',
    problemSolving: 'Problem Solving',
    communication: 'Communication',
    teamCollaboration: 'Team Collaboration',
    taskCompletion: 'Task Completion',
  };

  return (
    <DashboardLayout title="My Certificates" subtitle="Your verified internship completion certificates & performance reports">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Award size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No certificates yet</h3>
          <p className="text-gray-500 text-sm">Complete an internship to earn your first verified certificate!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certs.map(cert => {
            const isExpanded = expandedId === cert._id;
            const hasScores = cert.performanceScores &&
              Object.values(cert.performanceScores).some(v => v !== null && v !== undefined);

            return (
              <div key={cert._id} className="glass-card overflow-hidden hover:border-primary-500/25 transition-all">
                {/* Certificate header */}
                <div className="p-6 text-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-2xl pointer-events-none" />
                  <Award size={44} className="text-primary-400 mx-auto mb-3 relative z-10" />
                  <h3 className="text-base font-bold text-white relative z-10">{cert.internshipTitle}</h3>
                  <p className="text-sm text-gray-400 mt-1 relative z-10">at {cert.companyName}</p>

                  {/* Overall rating badge */}
                  {cert.overallRating && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full relative z-10"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                      <Star size={12} className="text-amber-400" />
                      <span className="text-xs font-bold text-emerald-400">{cert.overallRating}% Overall Performance</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-300">{cert.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Issued On</span>
                    <span className="text-gray-300">{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Certificate ID</span>
                    <span className="text-gray-300 font-mono text-xs">{cert.certificateId?.substring(0, 14)}…</span>
                  </div>

                  {/* Company Remarks */}
                  {cert.companyRemarks && (
                    <div className="p-3 rounded-xl mt-1"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-gray-500 mb-1">Company Remarks</p>
                      <p className="text-xs text-gray-300 italic leading-relaxed">"{cert.companyRemarks}"</p>
                    </div>
                  )}

                  {/* Performance breakdown toggle */}
                  {hasScores && (
                    <>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cert._id)}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-medium transition-all hover:bg-white/5"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="flex items-center gap-2 text-gray-300">
                          <BarChart2 size={13} className="text-primary-400" />
                          Performance Breakdown
                        </span>
                        {isExpanded ? <ChevronUp size={13} className="text-gray-500" /> : <ChevronDown size={13} className="text-gray-500" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-3 animate-fade-in pt-1">
                          {Object.entries(PERF_LABELS).map(([key, label]) => {
                            const val = cert.performanceScores?.[key];
                            if (val == null) return null;
                            return <PerfBar key={key} label={label} value={val} />;
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Verified badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span className="text-xs text-gray-500">Blockchain-style QR verification included</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(cert._id, cert.studentName)}
                      disabled={downloading === cert._id}
                      className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 py-2.5">
                      {downloading === cert._id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />}
                      {downloading === cert._id ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer"
                      className="btn-secondary text-sm flex items-center justify-center gap-2 px-4 py-2.5">
                      <ExternalLink size={14} /> Verify
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Certificates;
