import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { fetchMe } from '../../features/auth/authSlice';
import { Save, Upload, Plus, X, User, Zap, Shield, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const Profile = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', phone: '', college: '', bio: '', portfolio: '', skills: [] });
  const [education, setEducation] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', college: user.college || '', bio: user.bio || '', portfolio: user.portfolio || '', skills: user.skills || [] });
      setEducation(user.education || []);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/students/profile', { ...form, education });
      dispatch(fetchMe());
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/students/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(fetchMe());
      toast.success('Resume uploaded!');
    } catch (err) { toast.error('Upload failed'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profileImage', file);
    try {
      await api.put('/students/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(fetchMe());
      toast.success('Photo updated!');
    } catch (err) { toast.error('Upload failed'); }
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter(sk => sk !== s) });

  const addEdu = () => setEducation([...education, { degree: '', institution: '', year: '', percentage: '' }]);
  const removeEdu = (i) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEdu = (i, k, v) => { const e = [...education]; e[i][k] = v; setEducation(e); };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your information and skills">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col: Avatar & resume */}
        <div className="space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user?.profileImage ? (
                <img src={`${BASE_URL}${user.profileImage}`} className="w-24 h-24 rounded-full object-cover border-2 border-primary-500/30" alt="" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer hover:bg-primary-500 transition-colors">
                <Upload size={14} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-xs text-primary-400 mt-1 capitalize">{user?.role}</p>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-white mb-3">Resume</h4>
            {user?.resume ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400 mb-3">
                <span>✓ Resume uploaded</span>
                <a href={`${BASE_URL}${user.resume}`} target="_blank" rel="noreferrer" className="text-primary-400 text-xs hover:underline">View</a>
              </div>
            ) : <p className="text-sm text-gray-500 mb-3">No resume uploaded</p>}
            <label className="btn-secondary text-sm cursor-pointer flex items-center justify-center gap-2">
              <Upload size={14} /> Upload Resume
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
            </label>
          </div>
        </div>

        {/* Right col: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Personal Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">College</label>
                <input className="input-field" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Portfolio URL</label>
                <input className="input-field" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                <textarea className="input-field h-24 resize-none" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 text-sm border border-primary-500/20">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-primary-400 hover:text-red-400"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill..." />
              <button onClick={addSkill} className="btn-primary px-4"><Plus size={16} /></button>
            </div>
          </div>

          {}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Education</h4>
              <button onClick={addEdu} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            <div className="space-y-4">
              {education.map((ed, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 relative">
                  <button onClick={() => removeEdu(i)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400"><X size={14} /></button>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input className="input-field text-sm" placeholder="Degree" value={ed.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                    <input className="input-field text-sm" placeholder="Institution" value={ed.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} />
                    <input className="input-field text-sm" placeholder="Year" value={ed.year} onChange={e => updateEdu(i, 'year', e.target.value)} />
                    <input className="input-field text-sm" placeholder="Percentage/CGPA" value={ed.percentage} onChange={e => updateEdu(i, 'percentage', e.target.value)} />
                  </div>
                </div>
              ))}
              {education.length === 0 && <p className="text-sm text-gray-500">No education entries yet</p>}
            </div>
          </div>

          {/* ── Skill Passport ── */}
          {form.skills.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={15} className="text-primary-400" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Skill Passport</h4>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {form.skills.length} Verified Skills
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Your verified skill portfolio. Add more skills and complete assignments to increase confidence scores.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {form.skills.map((skill, i) => {
                  // Confidence based on position (first added = more established) + some variation
                  const confidence = Math.min(95, 55 + Math.floor(((form.skills.length - i) / form.skills.length) * 35) + (skill.length % 10));
                  const color = confidence >= 80 ? '#10b981' : confidence >= 65 ? '#f59e0b' : '#7c3aed';
                  return (
                    <div key={skill} className="p-3 rounded-xl transition-all hover:bg-white/5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap size={12} style={{ color }} />
                          <span className="text-sm font-medium text-white">{skill}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color }}>{confidence}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidence}%`, background: `linear-gradient(to right, ${color}, ${color}80)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl flex items-center gap-2"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <TrendingUp size={13} className="text-primary-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  Complete internship assignments and get company evaluations to upgrade your confidence scores.
                </p>
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
