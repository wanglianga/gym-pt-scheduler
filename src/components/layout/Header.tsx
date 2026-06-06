import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Bell,
  Calendar as CalendarIcon,
  User,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'receptionist' | 'coach' | 'manager';

const ROLE_LABELS: Record<UserRole, string> = {
  receptionist: '前台',
  coach: '私教',
  manager: '店长',
};

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({
  currentRole,
  onRoleChange,
  onToggleSidebar,
  sidebarCollapsed,
}: HeaderProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const roleRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const notifications = [
    { id: 1, text: '新会员注册待审核', time: '5 分钟前', type: 'info' },
    { id: 2, text: '私教课预约确认提醒', time: '30 分钟前', type: 'warning' },
    { id: 3, text: '会员卡即将到期', time: '2 小时前', type: 'danger' },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-ink-900/95 backdrop-blur-md border-b border-ink-700">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-ink-300 hover:bg-ink-800 hover:text-orange transition-colors"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-orange flex items-center justify-center shadow-glow-orange">
              <span className="font-heading font-bold text-white text-lg">F</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-xl tracking-wide text-white">
                FIT<span className="text-orange">PRO</span>
              </h1>
              <p className="text-[10px] text-ink-400 -mt-0.5">健身管理系统</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setDatePickerOpen(false);
                setNotificationOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
                roleDropdownOpen
                  ? 'bg-ink-800 border-orange text-orange'
                  : 'bg-ink-800/50 border-ink-700 text-ink-200 hover:border-ink-600 hover:text-white'
              )}
            >
              <div className="w-2 h-2 rounded-full bg-orange shadow-glow-orange animate-pulse-slow" />
              <span className="text-sm font-medium hidden sm:inline">
                {ROLE_LABELS[currentRole]}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  'transition-transform duration-200',
                  roleDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 animate-scale-in origin-top-right">
                <div className="py-1.5 bg-ink-800 border border-ink-700 rounded-xl shadow-industrial">
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                        currentRole === role
                          ? 'text-orange bg-orange/10 border-l-2 border-orange'
                          : 'text-ink-200 hover:bg-ink-700/50 border-l-2 border-transparent'
                      )}
                    >
                      <span>{ROLE_LABELS[role]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dateRef}>
            <button
              onClick={() => {
                setDatePickerOpen(!datePickerOpen);
                setRoleDropdownOpen(false);
                setNotificationOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
                datePickerOpen
                  ? 'bg-ink-800 border-orange text-orange'
                  : 'bg-ink-800/50 border-ink-700 text-ink-200 hover:border-ink-600 hover:text-white'
              )}
            >
              <CalendarIcon size={16} />
              <span className="text-sm hidden md:inline">
                {formatDisplayDate(selectedDate)}
              </span>
            </button>

            {datePickerOpen && (
              <div className="absolute right-0 top-full mt-2 animate-scale-in origin-top-right">
                <div className="p-3 bg-ink-800 border border-ink-700 rounded-xl shadow-industrial">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-2 text-ink-100 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setRoleDropdownOpen(false);
                setDatePickerOpen(false);
              }}
              className={cn(
                'relative p-2 rounded-lg border transition-all duration-200',
                notificationOpen
                  ? 'bg-ink-800 border-orange text-orange'
                  : 'bg-ink-800/50 border-ink-700 text-ink-300 hover:border-ink-600 hover:text-white'
              )}
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 animate-scale-in origin-top-right">
                <div className="bg-ink-800 border border-ink-700 rounded-xl shadow-industrial overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
                    <h3 className="font-heading font-semibold text-white text-sm tracking-wide">
                      通知
                    </h3>
                    <span className="text-xs text-ink-400">
                      {notifications.length} 条未读
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 border-b border-ink-700 last:border-b-0 hover:bg-ink-700/30 transition-colors cursor-pointer"
                      >
                        <p className="text-sm text-ink-100">{notif.text}</p>
                        <p className="text-xs text-ink-400 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-ink-700">
                    <button className="w-full text-sm text-orange hover:text-orange-400 transition-colors">
                      查看全部通知
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-ink-700">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-600 to-ink-800 border-2 border-ink-600 flex items-center justify-center text-ink-300 hover:border-orange transition-colors cursor-pointer">
              <User size={18} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">管理员</p>
              <p className="text-xs text-ink-400">FitPro Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
