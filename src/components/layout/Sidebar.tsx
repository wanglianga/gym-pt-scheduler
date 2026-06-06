import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { UserRole } from './Header';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    path: '/',
    label: '工作台',
    icon: LayoutDashboard,
    roles: ['receptionist', 'coach', 'manager'],
  },
  {
    path: '/members',
    label: '会员管理',
    icon: Users,
    roles: ['receptionist', 'manager'],
  },
  {
    path: '/calendar',
    label: '教练日历',
    icon: CalendarDays,
    roles: ['coach', 'manager'],
  },
  {
    path: '/dashboard',
    label: '店长看板',
    icon: BarChart3,
    roles: ['manager'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  currentRole,
}: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const visibleMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static top-0 left-0 h-screen z-30 flex flex-col',
          'bg-ink-900 border-r border-ink-700',
          'transition-all duration-300 ease-in-out',
          collapsed
            ? 'w-0 lg:w-20 -translate-x-full lg:translate-x-0 overflow-hidden'
            : 'w-64 translate-x-0'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 lg:px-5 border-b border-ink-700 flex-shrink-0">
          <div
            className={cn(
              'flex items-center gap-2.5 overflow-hidden',
              collapsed && 'lg:justify-center lg:w-full'
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-orange flex items-center justify-center shadow-glow-orange flex-shrink-0">
              <Dumbbell size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-heading font-bold text-xl tracking-wide text-white whitespace-nowrap">
                  FIT<span className="text-orange">PRO</span>
                </h1>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-3">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                      collapsed && 'lg:justify-center lg:px-2',
                      isActive
                        ? 'bg-orange/15 text-orange shadow-glow-orange'
                        : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange rounded-r-full shadow-glow-orange" />
                    )}
                    <Icon
                      size={20}
                      className={cn(
                        'flex-shrink-0 transition-all duration-200',
                        (isActive || isHovered) && 'scale-110'
                      )}
                    />
                    {!collapsed && (
                      <span className="font-medium text-sm whitespace-nowrap animate-fade-in">
                        {item.label}
                      </span>
                    )}

                    {collapsed && isHovered && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white whitespace-nowrap shadow-industrial animate-scale-in origin-left z-50 pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-2 lg:p-3 border-t border-ink-700 flex-shrink-0">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'bg-ink-800/50 text-ink-400 hover:bg-ink-800 hover:text-white',
              'border border-ink-700 hover:border-ink-600',
              'transition-all duration-200',
              collapsed && 'lg:justify-center lg:px-2'
            )}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="text-sm font-medium">收起菜单</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
