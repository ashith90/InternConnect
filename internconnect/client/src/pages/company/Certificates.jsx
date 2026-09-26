import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Award, Loader2, Star, BarChart2, CheckCircle2, ChevronDown, ChevronUp,
  User, ClipboardList, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Slider input for performance scores
const ScoreSlider = ({ label, value, onChange }) => {
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#7c3aed';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range" min="0" max="100" value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)`,
          accentColor: color,
        }}
      />
    </div>
  );
};

// Performance evaluation modal
const EvaluationModal = ({ app, onClose, onSuccess }) => {
  const [scores, setScores] = useState({
    technicalSkills: 80,
    problemSolving: 75,
    communication: 80,
    teamCollaboration: 80,
    taskCompletion: 90,
  });
  const [remarks, setRemarks] = useState('');
  const [generating, setGenerating] = useState(false);

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await api.post(`/certificates/${app._id}/generate`, {
        performanceScores: scores,
        overallRating: overall,
        companyRemarks: remarks,
      });
      toast.success(r.data.message || 'Certificate generated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    }
    setGenerating(false);
  };

  const setScore = (key, val) => setScores(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg p-6 border border-white/10 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Performance Evaluation</h3>
            <p className="text-xs text-gray-400 mt-0.5">Rate {app.studentId?.name} before issuing certificate</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Student info */}
        <div className="p-3 rounded-xl mb-5 flex items-center gap-3"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            {app.studentId?.name?.[0]}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{app.studentId?.name}</div>
            <div className="text-xs text-gray-400">{app.internshipId?.title} · {app.internshipId?.duration}</div>
          </div>
          <div className="ml-auto text-center">
            <div className="text-2xl font-black" style={{ color: overall >= 80 ? '#10b981' : '#f59e0b' }}>{overall}%</div>
            <div className="text-xs text-gray-500">Overall</div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5 mb-5">
          <ScoreSlider label="Technical Skills" value={scores.technicalSkills} onChange={v => setScore('technicalSkills', v)} />
          <ScoreSlider label="Problem Solving" value={scores.problemSolving} onChange={v => setScore('problemSolving', v)} />
          <ScoreSlider label="Communication" value={scores.communication} onChange={v => setScore('communication', v)} />
          <ScoreSlider label="Team Collaboration" value={scores.teamCollaboration} onChange={v => setScore('teamCollaboration', v)} />
          <ScoreSlider label="Task Completion" value={scores.taskCompletion} onChange={v => setScore('taskCompletion', v)} />
        </div>

        {/* Remarks */}
        <div className="mb-5">
          <label className="text-xs text-gray-400 block mb-1.5">Company Remarks (Optional)</label>
          <textarea
            className="input-field h-20 resize-none text-sm"
            placeholder="Exceptional intern who demonstrated strong technical skills..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>

        {/* Action */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
            Generate Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

const CompanyCertificates = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evalModal, setEvalModal] = useState(null);

  const fetchData = () => {
    api.get('/applications/company')
      .then(r => {
        setApps(r.data.applications.filter(a => a.status === 'Completed'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchData, []);

  return (
    <DashboardLayout title="Certificates" subtitle="Issue verified certificates with performance evaluations">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Award size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No completed internships</h3>
          <p className="text-gray-500 text-sm">Mark an applicant as 'Completed' in the Applicants page to issue a certificate.</p>
        </div>
      ) : (
        <>
          {/* Info banner */}
          <div className="p-4 rounded-xl mb-6 flex items-start gap-3"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <BarChart2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-200">
              Before generating each certificate, you can rate the intern across 5 dimensions. These scores will appear on their <strong>Verified Skill Passport</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(app => (
              <div key={app._id} className="glass-card p-6 flex flex-col justify-between hover:border-primary-500/25 transition-all">
                <div>
                  {/* Student */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                      {app.studentId?.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{app.studentId?.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{app.studentId?.email}</p>
                    </div>
                  </div>

                  {/* Internship details */}
                  <div className="p-3 rounded-xl mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <ClipboardList size={11} />
                      <span className="font-semibold text-white">{app.internshipId?.title}</span>
                    </div>
                    <div className="text-xs text-gray-500">Duration: {app.internshipId?.duration}</div>
                  </div>

                  {/* Skills */}
                  {app.studentId?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {app.studentId.skills.slice(0, 5).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.12)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEvalModal(app)}
                  className="btn-primary w-full flex justify-center items-center gap-2 py-2.5">
                  <Award size={15} /> Evaluate & Generate
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Evaluation Modal */}
      {evalModal && (
        <EvaluationModal
          app={evalModal}
          onClose={() => setEvalModal(null)}
          onSuccess={fetchData}
        />
      )}
    </DashboardLayout>
  );
};

export default CompanyCertificates;
