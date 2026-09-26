const StatusBadge = ({ status }) => {
  const map = {
    // Application statuses
    'Applied': 'badge badge-applied',
    'Under Review': 'badge badge-review',
    'Shortlisted': 'badge badge-review',
    'Assessment': 'badge badge-applied',
    'Interview': 'badge badge-applied',
    'Selected': 'badge badge-selected',
    'Rejected': 'badge badge-rejected',
    'Completed': 'badge badge-completed',
    // Assignment/submission statuses
    'Pending': 'badge badge-pending',
    'Submitted': 'badge badge-review',
    'Reviewed': 'badge badge-applied',
    'Approved': 'badge badge-approved',
    // Internship statuses
    'active': 'badge badge-selected',
    'closed': 'badge badge-rejected',
    'pending': 'badge badge-pending',
  };

  const customStyle = {
    'Shortlisted': { background: 'rgba(245,158,11,0.15)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.3)' },
    'Assessment': { background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' },
    'Interview': { background: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' },
  };

  if (customStyle[status]) {
    return (
      <span style={customStyle[status]}
        className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full">
        {status}
      </span>
    );
  }

  return <span className={map[status] || 'badge bg-gray-500/20 text-gray-400'}>{status}</span>;
};

export default StatusBadge;
