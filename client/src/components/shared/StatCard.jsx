const StatCard = ({ icon: Icon, label, value, sub, color = 'primary', trend }) => {
  const colors = {
    primary: 'from-primary-600/20 to-violet-600/10 border-primary-500/20 text-primary-400',
    blue: 'from-blue-600/20 to-cyan-600/10 border-blue-500/20 text-blue-400',
    green: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-orange-600/10 border-amber-500/20 text-amber-400',
    red: 'from-red-600/20 to-pink-600/10 border-red-500/20 text-red-400',
  };

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${colors[color]} border animate-slide-up`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          {Icon && <Icon size={22} className={colors[color].split(' ')[3]} />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
};

export default StatCard;
