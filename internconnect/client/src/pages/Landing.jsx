import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, ClipboardList, Award,
  BarChart3, Target, TrendingUp,
  GitBranch, BookOpen, CheckCircle2,
} from 'lucide-react';

const Landing = () => {
  const pipeline = [
    { label: 'Discover', icon: Search },
    { label: 'Gap Analysis', icon: Target },
    { label: 'Prepare', icon: BookOpen },
    { label: 'Apply', icon: ArrowRight },
    { label: 'Complete Tasks', icon: ClipboardList },
    { label: 'Build Portfolio', icon: BarChart3 },
    { label: 'Get Certified', icon: Award },
  ];

  const features = [
    {
      icon: Target,
      title: 'Career Readiness Score',
      desc: 'Know exactly how ready you are. See what skills you have, what you\'re missing, and what to improve.',
    },
    {
      icon: TrendingUp,
      title: 'Intelligent Fit Scores',
      desc: 'Every internship shows your match score, matched skills, and missing skills — with a learning roadmap.',
    },
    {
      icon: GitBranch,
      title: 'Application Pipeline',
      desc: 'Track your journey: Applied → Shortlisted → Assessment → Interview → Selected.',
    },
    {
      icon: BookOpen,
      title: 'Skill Gap Roadmap',
      desc: 'Get a personalized week-by-week learning plan to close skill gaps and boost your readiness.',
    },
    {
      icon: ClipboardList,
      title: 'Real-World Assignments',
      desc: 'Complete actual tasks from companies during your internship. Build provable experience.',
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      desc: 'Earn QR-verified PDF certificates on completion, linkable to a live employer verification page.',
    },
  ];

  const roles = [
    {
      role: 'Student',
      emoji: '🎓',
      features: [
        'Personalized career readiness score',
        'Fit scores for every internship',
        'Skill gap analysis & roadmaps',
        'Transparent application pipeline',
        'Real assignment submission',
        'Verified portfolio & certificates',
      ],
    },
    {
      role: 'Company',
      emoji: '🏢',
      features: [
        'Post and manage internship listings',
        'Applicants ranked by skill match',
        'Skill distribution analytics',
        'Application pipeline management',
        'Assign real-world tasks',
        'Issue verified certificates',
      ],
    },
    {
      role: 'Admin',
      emoji: '🛡️',
      features: [
        'Manage all users & verifications',
        'Approve internship listings',
        'Platform-wide analytics',
        'Discussion moderation',
        'Certificate oversight',
        'Comprehensive reporting',
      ],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Navbar */}
      <nav style={{ background: '#111111', borderBottom: '1px solid #222' }}
        className="fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IC</span>
            </div>
            <span className="font-semibold text-white">InternConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-5 py-2">Sign In</Link>
            <Link to="/login" className="btn-primary text-sm px-5 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            From Skill Gaps<br />
            <span style={{ color: '#a78bfa' }}>to Career Wins.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            InternConnect doesn't just help you find internships — it tells you{' '}
            <strong className="text-white">how ready you are</strong>, shows you{' '}
            <strong className="text-white">exactly what to learn</strong>, tracks your journey,
            and builds your <strong className="text-white">verified portfolio</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-10">
            The career platform built for students who want more than a job board.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Start Your Career Journey <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>

          <div className="flex justify-center gap-12 mt-14">
            {[['500+', 'Students'], ['100+', 'Companies'], ['1K+', 'Certificates']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-xs text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Pipeline */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid #1f1f1f' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">The Better Internship Model</h2>
            <p className="text-gray-500">Not just "Find → Apply". A complete career development lifecycle.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {pipeline.map(({ label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <Icon size={20} className="text-violet-400" />
                  </div>
                  <span className="text-xs text-gray-500 text-center font-medium max-w-[70px] leading-tight">{label}</span>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="mb-5 w-5 h-px" style={{ background: '#333' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Readiness Demo */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8">
            <div className="flex items-center gap-2 mb-5">
              <Target size={16} className="text-violet-400" />
              <span className="text-sm font-medium text-gray-300">Career Readiness — Live Preview</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">MERN Stack Developer</h3>
                <p className="text-gray-500 text-sm mb-5">TechCorp Solutions · 3 Months · ₹18,000/mo</p>
                <div className="space-y-2 mb-5">
                  {[
                    { skill: 'React.js', status: 'matched' },
                    { skill: 'Node.js', status: 'matched' },
                    { skill: 'MongoDB', status: 'matched' },
                    { skill: 'Docker', status: 'missing' },
                    { skill: 'REST APIs', status: 'partial' },
                  ].map(({ skill, status }) => (
                    <div key={skill} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <span className="text-sm text-white">{skill}</span>
                      <span className="text-xs font-medium"
                        style={{ color: status === 'matched' ? '#6ee7b7' : status === 'missing' ? '#fde68a' : '#93c5fd' }}>
                        {status === 'matched' ? '✓ Strong' : status === 'missing' ? '⚠ Missing' : '~ Intermediate'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <p className="text-xs text-amber-300 font-semibold mb-1">Suggested next steps:</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>• Study Docker fundamentals (5 days)</li>
                    <li>• Build a containerized Node.js app</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative mb-4" style={{ width: 140, height: 140 }}>
                  <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="56" fill="none" stroke="#222" strokeWidth="10" />
                    <circle cx="70" cy="70" r="56" fill="none" stroke="#f59e0b" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * 0.22}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">78%</span>
                    <span className="text-xs text-amber-400">Ready</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mb-2">After learning Docker:</p>
                <span className="text-xl font-bold text-emerald-400">→ 94% Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid #1f1f1f' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Everything you need to succeed</h2>
            <p className="text-gray-500">A complete ecosystem — not just a job board</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="glass-card p-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: '#1e1e1e' }}>
                  <Icon size={18} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid #1f1f1f' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Built for everyone</h2>
            <p className="text-gray-500">Three tailored experiences, one platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(({ role, emoji, features: roleFeatures }) => (
              <div key={role} className="glass-card p-6">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="text-lg font-semibold text-white mb-4">{role}</h3>
                <ul className="space-y-2.5">
                  {roleFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={13} className="text-violet-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to take control of your career?</h2>
          <p className="text-gray-500 mb-7">
            Join InternConnect and start your journey from skill gaps to career wins.
          </p>
          <Link to="/login" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f1f1f' }} className="py-7 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-700 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IC</span>
            </div>
            <span className="text-sm text-gray-500">InternConnect © 2026</span>
          </div>
          <div className="text-sm text-gray-600">The Career Readiness Platform</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
