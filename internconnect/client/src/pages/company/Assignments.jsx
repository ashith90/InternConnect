import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../utils/api';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
import {
  Plus, X, FileText, CheckCircle, Users, ClipboardList,
  Clock, ExternalLink, ChevronDown, ChevronUp, Info,
  Link2, Eye, Loader2, Star, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CompanyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ internshipId: '', title: '', description: '', deadline: '', maxScore: 100 });
  const [previewStudents, setPreviewStudents] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [viewingSub, setViewingSub] = useState(null);
  const [viewingAssignmentId, setViewingAssignmentId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ score: '', feedback: '' });
  const [reviewing, setReviewing] = useState(false);

  const fetchData = async () => {
    try {
      const [asgRes, intRes] = await Promise.all([
        api.get('/assignments/company'),
        api.get('/internships/company/mine'),
      ]);
      setAssignments(asgRes.data.assignments || []);
      setInternships(intRes.data.internships || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Preview which students will receive this assignment
  const handleInternshipChange = async (internshipId) => {
    setForm(f => ({ ...f, internshipId }));
    if (!internshipId) { setPreviewStudents([]); return; }
    setPreviewLoading(true);
    try {
      const r = await api.get(`/assignments/internship/${internshipId}/students`);
      setPreviewStudents(r.data.students || []);
    } catch { setPreviewStudents([]); }
    setPreviewLoading(false);
  };

  const handleCreate = async () => {
    if (!form.internshipId || !form.title || !form.description || !form.deadline) {
      return toast.error('Please fill all required fields');
    }
    try {
      const r = await api.post('/assignments', form);
      toast.success(r.data.message || 'Assignment created!');
      setShowForm(false);
      setForm({ internshipId: '', title: '', description: '', deadline: '', maxScore: 100 });
      setPreviewStudents([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const fetchSubmissions = async (id) => {
    try {
      const r = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(prev => ({ ...prev, [id]: r.data.submissions }));
    } catch (err) { console.error(err); }
  };

  const openReview = (sub, assignmentId) => {
    setViewingSub(sub);
    setViewingAssignmentId(assignmentId);
    setReviewForm({ score: sub.score ?? '', feedback: sub.feedback ?? '' });
  };

  const handleReview = async (status) => {
    setReviewing(true);
    try {
      await api.put(`/assignments/submissions/${viewingSub._id}`, {
        status, feedback: reviewForm.feedback, score: reviewForm.score,
      });
      toast.success(`Marked as ${status}`);
      const asgId = viewingAssignmentId;
      setViewingSub(null);
      setViewingAssignmentId(null);
      // Refresh the submissions for the parent assignment
      if (asgId) await fetchSubmissions(asgId);
    } catch { toast.error('Failed to review'); }
    setReviewing(false);
  };

  const getMimeIcon = (mime = '') => {
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('image')) return '🖼';
    if (mime.includes('video')) return '🎬';
    if (mime.includes('zip') || mime.includes('rar')) return '🗜';
    if (mime.includes('text') || mime.includes('javascript') || mime.includes('python')) return '💻';
    return '📎';
  };

  return (
    <DashboardLayout title="Assignments" subtitle="Create tasks for your active interns and review their submissions">

      {/* Create button */}
      <button onClick={() => setShowForm(true)}
        className="btn-primary flex items-center gap-2 mb-6">
        <Plus size={16} /> Create Assignment
      </button>

      {/* Create form */}
      {showForm && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-primary-400" /> New Assignment
            </h3>
            <button onClick={() => { setShowForm(false); setPreviewStudents([]); }}
              className="text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Internship selector */}
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Internship *</label>
              <select className="input-field" value={form.internshipId}
                onChange={e => handleInternshipChange(e.target.value)}>
                <option value="">Select internship to assign</option>
                {internships.map(i => (
                  <option key={i._id} value={i._id}>{i.title}</option>
                ))}
              </select>
            </div>

            {/* Student preview */}
            {form.internshipId && (
              <div className="md:col-span-2">
                {previewLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                    <Loader2 size={13} className="animate-spin" /> Checking active students…
                  </div>
                ) : previewStudents.length > 0 ? (
                  <div className="p-3 rounded-xl flex flex-wrap items-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-emerald-300 font-semibold">
                      Will be assigned to {previewStudents.length} student{previewStudents.length !== 1 ? 's' : ''}:
                    </span>
                    {previewStudents.map(s => (
                      <span key={s._id} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl flex items-start gap-2"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Info size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">
                      No active students found for this internship. Go to <strong>Applicants</strong> and move students to Shortlisted, Assessment, Interview, or Selected stage first.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Assignment Title *</label>
              <input className="input-field" placeholder="e.g. Build a REST API..."
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Deadline *</label>
              <input type="date" className="input-field" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max Score</label>
              <input type="number" className="input-field" value={form.maxScore}
                onChange={e => setForm({ ...form, maxScore: e.target.value })} min="1" max="100" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Description & Instructions *</label>
              <textarea className="input-field h-28 resize-none text-sm" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what students need to do, deliverables, and any resources..." />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setPreviewStudents([]); }}
              className="btn-secondary px-5">Cancel</button>
            <button onClick={handleCreate}
              disabled={previewStudents.length === 0}
              className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={15} /> Create & Assign to {previewStudents.length} Student{previewStudents.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Assignments list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : assignments.length === 0 && !showForm ? (
        <div className="glass-card p-16 text-center">
          <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold mb-2">No assignments yet</h3>
          <p className="text-gray-500 text-sm">Create your first assignment to give your interns real tasks to complete.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const isExpanded = expandedId === a._id;
            const subs = submissions[a._id];
            const isPast = new Date(a.deadline) < new Date();

            return (
              <div key={a._id} className="glass-card overflow-hidden">
                {/* Assignment header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-white">{a.title}</h3>
                        {isPast ? (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                            Deadline Passed
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{a.internshipId?.title}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users size={12} />
                        <span>{a.assignedTo?.length || 0} assigned</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-primary-400">
                        <FileText size={12} />
                        <span>{a.submissionCount || 0} submitted</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={12} />
                        <span>{new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed line-clamp-2">{a.description}</p>

                  {/* Assigned students */}
                  {a.assignedTo?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {a.assignedTo.slice(0, 5).map(s => (
                        <span key={s._id} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.1)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                          <GraduationCap size={10} />{s.name}
                        </span>
                      ))}
                      {a.assignedTo.length > 5 && (
                        <span className="text-xs text-gray-600">+{a.assignedTo.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submissions panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-5 pb-5 pt-4 animate-fade-in">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={12} /> Submissions ({subs?.length ?? '...'})
                    </h4>
                    {!subs ? (
                      <div className="flex justify-center py-6">
                        <Loader2 size={20} className="text-primary-600 animate-spin" />
                      </div>
                    ) : subs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No submissions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {subs.map(sub => (
                          <div key={sub._id} className="p-4 rounded-xl transition-all"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                  {sub.studentId?.name?.[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-white">{sub.studentId?.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                    <span>{sub.studentId?.college}</span>
                                    <span>· {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    {sub.score !== null && sub.score !== undefined && (
                                      <span className="flex items-center gap-0.5 text-amber-400">
                                        <Star size={10} fill="currentColor" /> {sub.score}/{a.maxScore || 100}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={sub.status} />
                                <button onClick={() => openReview(sub, a._id)}
                                  className="text-xs px-3 py-1 rounded-lg text-primary-400 hover:text-primary-300 transition-colors"
                                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                  <Eye size={12} className="inline mr-1" /> Review
                                </button>
                              </div>
                            </div>

                            {/* Submission note */}
                            {sub.note && (
                              <p className="text-xs text-gray-400 mt-3 p-2.5 rounded-lg leading-relaxed italic"
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                "{sub.note}"
                              </p>
                            )}

                            {/* Links */}
                            {sub.links?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {sub.links.map((l, i) => (
                                  <a key={i} href={l.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                                    style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}>
                                    <Link2 size={11} /> {l.label || 'Link'}
                                    <ExternalLink size={10} />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Files */}
                            {sub.files?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {sub.files.map((f, i) => (
                                  <a key={i} href={`${BASE_URL}${f.path}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <span>{getMimeIcon(f.mimetype)}</span> {f.originalname}
                                    {f.size && <span className="text-gray-600">({(f.size / 1024).toFixed(0)}KB)</span>}
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Feedback */}
                            {sub.feedback && (
                              <p className="text-xs text-emerald-400 mt-2 flex items-start gap-1">
                                <CheckCircle size={11} className="mt-0.5 flex-shrink-0" />
                                Feedback: {sub.feedback}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Toggle */}
                <button
                  onClick={() => {
                    const next = isExpanded ? null : a._id;
                    setExpandedId(next);
                    if (next && !submissions[next]) fetchSubmissions(next);
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-300 transition-colors border-t border-white/5 flex items-center justify-center gap-1.5">
                  {isExpanded ? (
                    <><ChevronUp size={13} /> Hide submissions</>
                  ) : (
                    <><ChevronDown size={13} /> View submissions ({a.submissionCount || 0})</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-6 animate-slide-up border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Review Submission</h3>
                <p className="text-xs text-gray-400 mt-0.5">{viewingSub.studentId?.name}</p>
              </div>
              <button onClick={() => setViewingSub(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Submission content */}
            {viewingSub.note && (
              <div className="p-3 rounded-xl mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-gray-500 mb-1">Student's Note</p>
                <p className="text-sm text-gray-300 leading-relaxed">"{viewingSub.note}"</p>
              </div>
            )}

            {/* Links in modal */}
            {viewingSub.links?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Submitted Links</p>
                <div className="space-y-2">
                  {viewingSub.links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all hover:opacity-80"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                      <Link2 size={14} />
                      <span className="flex-1 truncate">{l.label || 'Link'}: {l.url}</span>
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Files in modal */}
            {viewingSub.files?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Submitted Files</p>
                <div className="space-y-2">
                  {viewingSub.files.map((f, i) => (
                    <a key={i} href={`${BASE_URL}${f.path}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#d1d5db' }}>
                      <span className="text-base">{getMimeIcon(f.mimetype)}</span>
                      <span className="flex-1 truncate">{f.originalname}</span>
                      {f.size && <span className="text-xs text-gray-600">{(f.size / 1024).toFixed(0)}KB</span>}
                      <ExternalLink size={12} className="text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Review form */}
            <div className="space-y-4 mt-4 pt-4 border-t border-white/8">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">
                  Score <span className="text-gray-600">(out of {viewingSub.maxScore || 100})</span>
                </label>
                <input type="number" className="input-field" placeholder="0–100"
                  value={reviewForm.score} onChange={e => setReviewForm(f => ({ ...f, score: e.target.value }))}
                  min="0" max={viewingSub.maxScore || 100} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Feedback</label>
                <textarea className="input-field h-24 resize-none text-sm"
                  placeholder="Great work on the API structure! Consider adding..."
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm(f => ({ ...f, feedback: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleReview('Approved')} disabled={reviewing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {reviewing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button onClick={() => handleReview('Reviewed')} disabled={reviewing}
                  className="flex-1 btn-secondary text-sm py-2.5">
                  Mark Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompanyAssignments;
