import { ConciergeBell, Dumbbell, Building2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from './Header';

interface RoleTabsProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLE_CONFIG: Array<{
  role: UserRole;
  label: string;
  icon: LucideIcon;
}> = [
  { role: 'receptionist', label: '前台', icon: ConciergeBell },
  { role: 'coach', label: '私教', icon: Dumbbell },
  { role: 'manager', label: '店长', icon: Building2 },
];

export default function RoleTabs({ currentRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="inline-flex p-1 bg-ink-800 rounded-xl border border-ink-700">
      {ROLE_CONFIG.map(({ role, label, icon: Icon }) => {
        const isActive = currentRole === role;
        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              isActive
                ? 'bg-gradient-orange text-white shadow-glow-orange'
                : 'text-ink-300 hover:text-white hover:bg-ink-700/50'
            )}
          >
            <Icon size={16} className={cn(isActive && 'animate-float')} />
            <span className="hidden sm:inline">{label}</span>
            {isActive && (
              <span className="absolute inset-0 rounded-lg bg-orange/20 animate-pulse-slow pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
