import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ children, title, subtitle }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="flex min-h-screen transition-colors duration-200"
      style={{ background: isLight ? '#f4f4f5' : '#0d0d0d' }}>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="section-title">{title}</h1>}
              {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>
          )}
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
