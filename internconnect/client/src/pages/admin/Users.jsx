import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { Search, ShieldBan, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    api.get(`/admin/users?${params}`).then(r => { setUsers(r.data.users); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(fetchUsers, [role]); 

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(); };

  const toggleStatus = async (id) => {
    try {
      const r = await api.put(`/admin/users/${id}/toggle`);
      setUsers(users.map(u => u._id === id ? r.data.user : u));
      toast.success(r.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage students, companies, and their platform access">
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        <select className="input-field w-auto" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="company">Companies</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10 text-xs uppercase text-gray-500 bg-white/5"><th className="p-4 font-semibold">User Info</th><th className="p-4 font-semibold">Role</th><th className="p-4 font-semibold">Joined</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">{u.name?.[0]}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{u.name} {u.companyName ? `(${u.companyName})` : ''}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4"><span className="badge bg-white/10 text-gray-300 capitalize">{u.role}</span></td>
                    <td className="p-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><span className={`badge ${u.isActive ? 'badge-selected' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleStatus(u._id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto transition-colors ${u.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                          {u.isActive ? <><ShieldBan size={14}/> Disable</> : <><ShieldCheck size={14}/> Enable</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
