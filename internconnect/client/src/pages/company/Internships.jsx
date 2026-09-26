import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../utils/api';
import { Plus, Edit3, Trash2, X, Save, Loader2, Building2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CompanyInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', skillsRequired: '', stipend: '', duration: '', deadline: '', domain: '', location: '', openings: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => { api.get('/internships/company/mine').then(r => { setInternships(r.data.internships); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(fetchData, []);

  const resetForm = () => { setForm({ title: '', description: '', skillsRequired: '', stipend: '', duration: '', deadline: '', domain: '', location: '', openings: '' }); setEditing(null); setShowForm(false); };

  const handleEdit = (i) => {
    setForm({ title: i.title, description: i.description, skillsRequired: i.skillsRequired?.join(', '), stipend: i.stipend, duration: i.duration, deadline: i.deadline?.split('T')[0], domain: i.domain, location: i.location, openings: i.openings });
    setEditing(i._id); setShowForm(true);
  };

  const handleSave = async () => {
    // Client-side validation
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    if (!form.description.trim()) { toast.error('Description is required.'); return; }
    if (!form.duration.trim()) { toast.error('Duration is required.'); return; }
    if (!form.deadline) { toast.error('Deadline is required.'); return; }

    setSaving(true);
    try {
      if (editing) { await api.put(`/internships/${editing}`, form); toast.success('Updated!'); }
      else { await api.post('/internships', form); toast.success('Internship posted! Awaiting admin approval.'); }
      resetForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try { await api.delete(`/internships/${id}`); setInternships(internships.filter(i => i._id !== id)); toast.success('Deleted'); } catch (err) { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="Internship Listings" subtitle="Post and manage your internship opportunities">
      <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 mb-6"><Plus size={16} /> Post Internship</button>

      {showForm && (
        <div className="glass-card p-6 mb-6 border border-primary-500/20 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editing ? 'Edit Internship' : 'New Internship'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Title *</label>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Frontend Developer Intern" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Description *</label>
              <textarea className="input-field h-28 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Skills Required (comma separated)</label>
              <input className="input-field" value={form.skillsRequired} onChange={e => setForm({ ...form, skillsRequired: e.target.value })} placeholder="React, Node.js" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Domain</label>
              <input className="input-field" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="Web Development" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Stipend (₹/month)</label>
              <input className="input-field" type="number" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Duration</label>
              <input className="input-field" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="3 Months" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Deadline *</label>
              <input className="input-field" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Location</label>
              <input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Openings</label>
              <input className="input-field" type="number" value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-4 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {editing ? 'Update' : 'Post'} Internship
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : internships.length === 0 ? (
        <div className="glass-card p-16 text-center"><Building2 size={48} className="text-gray-600 mx-auto mb-4" /><h3 className="text-lg text-white font-semibold mb-2">No listings</h3><p className="text-gray-500">Post your first internship above.</p></div>
      ) : (
        <div className="space-y-4">
          {internships.map(i => (
            <div key={i._id} className="glass-card p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">{i.title}</h3>
                  <StatusBadge status={i.isApprovedByAdmin ? i.status : 'pending'} />
                  {!i.isApprovedByAdmin && <span className="text-xs text-amber-400">Awaiting admin approval</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span>{i.domain}</span>
                  <span>₹{i.stipend?.toLocaleString()}/mo</span>
                  <span>{i.duration}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(i.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(i)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-primary-400 hover:bg-white/10 transition-all"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(i._id)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompanyInternships;
