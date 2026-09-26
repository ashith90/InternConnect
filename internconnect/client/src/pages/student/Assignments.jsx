import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../utils/api';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
import {
  Upload, ClipboardList, Clock, FileText, Loader2, Plus, X,
  Link2, ExternalLink, CheckCircle2, AlertCircle, Star, Building2,
  Send, Paperclip, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Utility: icon based on file type
const getMimeIcon = (mime = '', name = '') => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return '📄';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '🖼';
  if (['mp4', 'mov', 'webm'].includes(ext)) return '🎬';
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return '🗜';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'ipynb'].includes(ext)) return '💻';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['pptx'].includes(ext)) return '📑';
  return '📎';
};

// URL label suggestions
const LINK_LABELS = ['GitHub Repo', 'Live Demo', 'Google Drive', 'Colab Notebook', 'Figma Design', 'YouTube Video', 'Other'];

// Individual link input row
const LinkRow = ({ link, index, onChange, onRemove }) => (
  <div className="flex items-center gap-2">
    <select
      value={link.label}
      onChange={e => onChange(index, 'label', e.target.value)}
      className="input-field py-2 text-xs w-36 flex-shrink-0">
      {LINK_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
    </select>
    <input
      type="url"
      value={link.url}
      onChange={e => onChange(index, 'url', e.target.value)}
      placeholder="https://..."
      className="input-field py-2 text-sm flex-1"
    />
    <button onClick={() => onRemove(index)}
      className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 p-1">
      <X size={14} />
    </button>
  </div>
);

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmit, setActiveSubmit] = useState(null); // assignment._id being submitted
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([{ label: 'GitHub Repo', url: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = () => {
    api.get('/assignments/student')
      .then(r => { setAssignments(r.data.assignments || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openSubmitForm = (assignment) => {
    setActiveSubmit(assignment._id);
    setExpandedId(assignment._id);
    // Pre-fill from existing submission
    if (assignment.submission) {
      setNote(assignment.submission.note || '');
      setLinks(
        assignment.submission.links?.length > 0
          ? assignment.submission.links
          : [{ label: 'GitHub Repo', url: '' }]
      );
      setFiles([]);
    } else {
      setNote('');
      setLinks([{ label: 'GitHub Repo', url: '' }]);
      setFiles([]);
    }
  };

  const closeSubmitForm = () => {
    setActiveSubmit(null);
    setNote('');
    setFiles([]);
    setLinks([{ label: 'GitHub Repo', url: '' }]);
  };

  const addLink = () => setLinks(l => [...l, { label: 'GitHub Repo', url: '' }]);

  const updateLink = (index, field, value) => {
    setLinks(l => l.map((link, i) => i === index ? { ...link, [field]: value } : link));
  };

  const removeLink = (index) => {
    setLinks(l => l.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(f => f.filter((_, i) => i !== index));
  };

  const handleSubmit = async (assignmentId) => {
    const validLinks = links.filter(l => l.url.trim());
    if (!note.trim() && validLinks.length === 0 && files.length === 0) {
      return toast.error('Please add a note, link, or file before submitting.');
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('note', note);
    fd.append('links', JSON.stringify(validLinks));
    files.forEach(f => fd.append('files', f));

    try {
      await api.post(`/assignments/${assignmentId}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment submitted successfully! 🎉');
      closeSubmitForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  const overduePending = assignments.filter(
    a => new Date(a.deadline) < new Date() && !a.submission
  ).length;
  const submitted = assignments.filter(a => a.submission).length;
  const pending = assignments.filter(a => !a.submission && new Date(a.deadline) >= new Date()).length;

  return (
    <DashboardLayout title="My Assignments" subtitle="Complete tasks assigned by your internship company">

      {/* Stats bar */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: pending, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            { label: 'Submitted', value: submitted, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
            { label: 'Overdue', value: overduePending, color: 'text-red-400', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className="glass-card p-4 text-center"
              style={{ border: `1px solid ${border}`, background: bg }}>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No assignments yet</h3>
          <p className="text-gray-500 text-sm">
            You'll see tasks here once a company assigns them to you.<br />
            Make sure you have been shortlisted or selected for an internship.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {assignments.map(a => {
            const isPast = new Date(a.deadline) < new Date();
            const sub = a.submission;
            const isSubmitOpen = activeSubmit === a._id;
            const isExpanded = expandedId === a._id;

            return (
              <div key={a._id} className="glass-card overflow-hidden transition-all"
                style={{ borderColor: isSubmitOpen ? 'rgba(124,58,237,0.3)' : undefined }}>

                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))' }}>
                        📋
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">{a.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 size={10} />{a.companyId?.companyName || a.companyId?.name}
                          </span>
                          <span>·</span>
                          <span>{a.internshipId?.title}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={
                      sub?.status ||
                      (isPast ? 'Overdue' : 'Pending')
                    } />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{a.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <span className={`flex items-center gap-1 ${isPast ? 'text-red-400' : 'text-gray-500'}`}>
                      <Clock size={11} />
                      {isPast ? 'Deadline: ' : 'Due: '}
                      {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-gray-600">Max Score: {a.maxScore || 100}</span>
                    {sub?.score !== null && sub?.score !== undefined && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star size={11} fill="currentColor" />
                        Your Score: {sub.score}/{a.maxScore || 100}
                      </span>
                    )}
                  </div>

                  {/* Feedback */}
                  {sub?.feedback && (
                    <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-300 italic">"{sub.feedback}"</p>
                    </div>
                  )}

                  {/* Previous submission links preview */}
                  {sub?.links?.length > 0 && !isSubmitOpen && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sub.links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <Link2 size={11} /> {l.label}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Previous submission files */}
                  {sub?.files?.length > 0 && !isSubmitOpen && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sub.files.map((f, i) => (
                        <a key={i} href={`${BASE_URL}${f.path}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span>{getMimeIcon(f.mimetype, f.originalname)}</span> {f.originalname}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    {!isSubmitOpen && (
                      <button onClick={() => openSubmitForm(a)}
                        className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
                        <Send size={13} />
                        {sub ? 'Update Submission' : 'Submit Assignment'}
                      </button>
                    )}
                    {isSubmitOpen && (
                      <button onClick={closeSubmitForm}
                        className="btn-secondary text-sm px-4 py-2">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Submission Form ── */}
                {isSubmitOpen && (
                  <div className="border-t border-white/8 px-5 pb-5 pt-5 space-y-5 animate-fade-in"
                    style={{ background: 'rgba(124,58,237,0.03)' }}>

                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Send size={14} className="text-primary-400" />
                      {sub ? 'Update Your Submission' : 'Submit Your Work'}
                    </h4>

                    {/* Note */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">
                        Description / Notes <span className="text-gray-600">(optional)</span>
                      </label>
                      <textarea
                        className="input-field h-24 resize-none text-sm"
                        placeholder="Explain your approach, challenges faced, key learnings..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                      />
                    </div>

                    {/* Links section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Link2 size={12} className="text-blue-400" />
                          Share Links <span className="text-gray-600">(GitHub, Live Demo, Drive…)</span>
                        </label>
                        <button onClick={addLink}
                          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                          <Plus size={12} /> Add Link
                        </button>
                      </div>
                      <div className="space-y-2">
                        {links.map((link, i) => (
                          <LinkRow
                            key={i}
                            link={link}
                            index={i}
                            onChange={updateLink}
                            onRemove={removeLink}
                          />
                        ))}
                      </div>
                    </div>

                    {/* File uploads */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-2 flex items-center gap-1.5">
                        <Paperclip size={12} className="text-amber-400" />
                        Upload Files <span className="text-gray-600">(PDF, ZIP, images, code files, videos — up to 25MB each)</span>
                      </label>

                      {/* Drop zone */}
                      <label className="block border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-primary-500/40 transition-colors group"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <Upload size={22} className="text-gray-600 mx-auto mb-2 group-hover:text-primary-400 transition-colors" />
                        <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                          Click to browse or drag & drop files here
                        </p>
                        <p className="text-xs text-gray-700 mt-1">PDF, ZIP, JS, PY, PNG, MP4, DOCX and more</p>
                        <input type="file" className="hidden" multiple
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.md,.zip,.rar,.tar,.gz,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mov,.webm,.xlsx,.xls,.csv,.pptx,.ipynb" />
                      </label>

                      {/* Selected files */}
                      {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <span className="text-base">{getMimeIcon('', f.name)}</span>
                              <span className="text-xs text-gray-300 flex-1 truncate">{f.name}</span>
                              <span className="text-xs text-gray-600">{(f.size / 1024).toFixed(0)}KB</span>
                              <button onClick={() => removeFile(i)}
                                className="text-gray-500 hover:text-red-400 transition-colors">
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Validation hint */}
                    {note.trim() === '' && links.every(l => !l.url.trim()) && files.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <AlertCircle size={12} />
                        Add at least one note, link, or file to submit.
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      onClick={() => handleSubmit(a._id)}
                      disabled={submitting || (note.trim() === '' && links.every(l => !l.url.trim()) && files.length === 0)}
                      className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                        : <><Send size={15} /> {sub ? 'Update Submission' : 'Submit Assignment'}</>
                      }
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAssignments;
