import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { MessageSquare, ThumbsUp, Send, Search, Eye, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Discussions = () => {
  const { user } = useSelector(s => s.auth);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState('');

  const fetch = (q) => {
    const params = q ? `?search=${q}` : '';
    api.get(`/discussions${params}`).then(r => { setDiscussions(r.data.discussions); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => fetch(), []);

  const handleCreate = async () => {
    if (!newPost.title || !newPost.content) return toast.error('Title and content required');
    try {
      const r = await api.post('/discussions', newPost);
      setDiscussions([r.data.discussion, ...discussions]);
      setShowCreate(false); setNewPost({ title: '', content: '', tags: '' });
      toast.success('Posted!');
    } catch (err) { toast.error('Failed to post'); }
  };

  const handleLike = async (id) => {
    try {
      const r = await api.put(`/discussions/${id}/like`);
      setDiscussions(discussions.map(d => d._id === id ? { ...d, likes: r.data.liked ? [...d.likes, user._id] : d.likes.filter(l => l !== user._id) } : d));
    } catch (err) { toast.error('Failed'); }
  };

  const handleComment = async (id) => {
    if (!comment.trim()) return;
    try {
      const r = await api.post(`/discussions/${id}/comments`, { content: comment });
      setDiscussions(discussions.map(d => d._id === id ? r.data.discussion : d));
      setComment('');
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/discussions/${id}`);
      setDiscussions(discussions.filter(d => d._id !== id));
      toast.success('Deleted');
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="Discussion Forum" subtitle="Ask questions, share resources, and connect with peers">
      {}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-10 py-2.5" placeholder="Search discussions..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetch(search)} />
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5">
          <Plus size={16} /> New Post
        </button>
      </div>

      {}
      {showCreate && (
        <div className="glass-card p-6 mb-6 border border-primary-500/20 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">New Discussion</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>
          <input className="input-field mb-3" placeholder="Title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
          <textarea className="input-field h-32 resize-none mb-3" placeholder="What's on your mind?" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} />
          <input className="input-field mb-4" placeholder="Tags (comma separated)" value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} />
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2"><Send size={14} /> Post</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : discussions.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No discussions yet</h3>
          <p className="text-gray-500">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map(d => (
            <div key={d._id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {d.authorId?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                      <p className="text-xs text-gray-500">{d.authorId?.name} • {new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                    {(d.authorId?._id === user?._id || user?.role === 'admin') && (
                      <button onClick={() => handleDelete(d._id)} className="text-xs text-gray-600 hover:text-red-400">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{d.content}</p>

                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {d.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-primary-600/15 text-primary-300">{t}</span>)}
                    </div>
                  )}

                  {}
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => handleLike(d._id)} className={`flex items-center gap-1.5 text-xs ${d.likes?.includes(user?._id) ? 'text-primary-400' : 'text-gray-500 hover:text-primary-400'} transition-colors`}>
                      <ThumbsUp size={13} /> {d.likes?.length || 0}
                    </button>
                    <button onClick={() => setExpanded(expanded === d._id ? null : d._id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-400 transition-colors">
                      <MessageSquare size={13} /> {d.comments?.length || 0} Comments
                    </button>
                    <span className="flex items-center gap-1 text-xs text-gray-600"><Eye size={12} /> {d.views}</span>
                  </div>

                  {}
                  {expanded === d._id && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/5">
                      {d.comments?.map((c, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                            {c.authorId?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-300">{c.authorId?.name}</span>
                            <p className="text-xs text-gray-400 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input className="input-field text-xs py-1.5 flex-1" placeholder="Write a comment..."
                          value={comment} onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(d._id)} />
                        <button onClick={() => handleComment(d._id)} className="btn-primary px-3 py-1.5"><Send size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Discussions;
