import { useState, useEffect, ReactNode } from 'react';
import Header, { UserRole } from './Header';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export default function AppLayout({
  children,
  initialRole = 'receptionist',
}: AppLayoutProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-ink-900 bg-grid-pattern bg-grid">
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          currentRole={currentRole}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main
            className={cn(
              'flex-1 p-4 sm:p-6 lg:p-8 overflow-auto',
              'transition-opacity duration-500',
              isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-ink-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-orange/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <span className="text-ink-400 text-sm tracking-wider">
                    FITPRO 加载中...
                  </span>
                </div>
              </div>
            ) : (
              <div className="animate-slide-up">{children}</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
