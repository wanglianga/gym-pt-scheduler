import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CalendarX,
  Package,
  ChevronRight,
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/store/useBookingStore';
import { usePackageStore } from '@/store/usePackageStore';
import { useMemberStore } from '@/store/useMemberStore';
import type { Booking, CoursePackage } from '@/types';
import { BOOKING_STATUS_LABEL, SPECIALTY_LABEL } from '@/types';
import { daysBetween, formatDate, isExpired, parseDate } from '@/utils/date';

type TodoCategory = 'reschedule' | 'leave' | 'expiring';

interface TodoItem {
  id: string;
  category: TodoCategory;
  title: string;
  subtitle: string;
  timeLabel?: string;
  urgency: 'high' | 'medium' | 'low';
  data: Booking | CoursePackage;
}

export default function TodoList() {
  const [activeTab, setActiveTab] = useState<TodoCategory | 'all'>('all');
  const { bookings, loadBookings, updateBookingStatus } = useBookingStore();
  const { packages, loadPackages, getExpiringPackages } = usePackageStore();
  const { members, loadMembers, getMemberById } = useMemberStore();

  useEffect(() => {
    loadBookings();
    loadPackages();
    loadMembers();
  }, [loadBookings, loadPackages, loadMembers]);

  const todos = useMemo<TodoItem[]>(() => {
    const list: TodoItem[] = [];

    const rescheduleBookings = bookings.filter((b) => b.status === 'scheduled');
    rescheduleBookings.forEach((b) => {
      const member = getMemberById(b.memberId);
      const days = daysBetween(new Date(), b.date);
      list.push({
        id: `r-${b.id}`,
        category: 'reschedule',
        title: member?.name ?? '未知会员',
        subtitle: `${SPECIALTY_LABEL[b.specialty]} · ${formatDate(parseDate(b.date))} ${b.startTime}`,
        timeLabel: days <= 1 ? '即将上课' : `${days}天后`,
        urgency: days <= 1 ? 'high' : days <= 3 ? 'medium' : 'low',
        data: b,
      });
    });

    const leaveBookings = bookings.filter((b) => b.status === 'leave');
    leaveBookings.forEach((b) => {
      const member = getMemberById(b.memberId);
      list.push({
        id: `l-${b.id}`,
        category: 'leave',
        title: member?.name ?? '未知会员',
        subtitle: `${SPECIALTY_LABEL[b.specialty]} · 请假待处理`,
        timeLabel: b.cancelReason?.slice(0, 20),
        urgency: 'high',
        data: b,
      });
    });

    const expiring = getExpiringPackages(30);
    expiring.forEach((p) => {
      const member = getMemberById(p.memberId);
      const days = daysBetween(new Date(), p.expireDate);
      const remaining = p.totalSessions - p.usedSessions;
      list.push({
        id: `e-${p.id}`,
        category: 'expiring',
        title: member?.name ?? '未知会员',
        subtitle: `${p.name} · 剩余${remaining}节`,
        timeLabel: days <= 7 ? '即将过期' : `${days}天后过期`,
        urgency: days <= 7 ? 'high' : days <= 15 ? 'medium' : 'low',
        data: p,
      });
    });

    return list.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.urgency] - order[b.urgency];
    });
  }, [bookings, packages, members, getMemberById, getExpiringPackages]);

  const filteredTodos = useMemo(() => {
    if (activeTab === 'all') return todos;
    return todos.filter((t) => t.category === activeTab);
  }, [todos, activeTab]);

  const stats = useMemo(
    () => ({
      all: todos.length,
      reschedule: todos.filter((t) => t.category === 'reschedule').length,
      leave: todos.filter((t) => t.category === 'leave').length,
      expiring: todos.filter((t) => t.category === 'expiring').length,
    }),
    [todos]
  );

  const handleConfirm = (item: TodoItem) => {
    if (item.category === 'reschedule' && 'status' in item.data) {
      updateBookingStatus(item.data.id, 'confirmed');
    }
  };

  const handleReject = (item: TodoItem) => {
    if (item.category === 'leave' && 'status' in item.data) {
      updateBookingStatus(item.data.id, 'cancelled');
    } else if (item.category === 'reschedule' && 'status' in item.data) {
      updateBookingStatus(item.data.id, 'cancelled');
    }
  };

  const handleApproveLeave = (item: TodoItem) => {
    console.log('批准请假', item.data);
  };

  const handleRemind = (item: TodoItem) => {
    console.log('发送提醒', item.data);
  };

  const getCategoryIcon = (category: TodoCategory) => {
    switch (category) {
      case 'reschedule':
        return CalendarCheck;
      case 'leave':
        return CalendarX;
      case 'expiring':
        return Package;
    }
  };

  const getCategoryStyles = (category: TodoCategory) => {
    switch (category) {
      case 'reschedule':
        return { icon: 'text-orange', bg: 'bg-orange/15', badge: 'badge-orange' };
      case 'leave':
        return { icon: 'text-info', bg: 'bg-info/15', badge: 'badge-info' };
      case 'expiring':
        return { icon: 'text-danger', bg: 'bg-danger/15', badge: 'badge-danger' };
    }
  };

  const tabs: Array<{ key: TodoCategory | 'all'; label: string; count: number }> = [
    { key: 'all', label: '全部', count: stats.all },
    { key: 'reschedule', label: '待确认', count: stats.reschedule },
    { key: 'leave', label: '请假', count: stats.leave },
    { key: 'expiring', label: '过期', count: stats.expiring },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-ink-700 bg-ink-800 shadow-industrial">
      <div className="border-b border-ink-700 p-4">
        <h3 className="font-heading text-lg font-semibold tracking-wide text-ink-50">
          待办事项
        </h3>

        <div className="mt-3 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'border-orange bg-orange/10 text-orange'
                  : 'border-ink-600 bg-ink-700 text-ink-300 hover:border-orange/60 hover:text-orange'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  activeTab === tab.key ? 'bg-orange/30 text-orange' : 'bg-ink-600 text-ink-400'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTodos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-ink-500">
            <Check className="mb-3 h-10 w-10 text-lime/50" />
            <p className="text-sm">暂无待办事项</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-700">
            {filteredTodos.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const styles = getCategoryStyles(item.category);
              const member =
                'memberId' in item.data ? getMemberById(item.data.memberId) : undefined;

              return (
                <li
                  key={item.id}
                  className={cn(
                    'group relative p-4 transition-all duration-200 hover:bg-ink-700/50',
                    item.urgency === 'high' && 'bg-danger/5'
                  )}
                >
                  {item.urgency === 'high' && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-danger" />
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                        styles.bg
                      )}
                    >
                      <Icon className={cn('h-5 w-5', styles.icon)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-ink-400" />
                          <span className="truncate text-sm font-semibold text-ink-100">
                            {item.title}
                          </span>
                        </div>
                        {item.timeLabel && (
                          <span
                            className={cn(
                              'flex flex-shrink-0 items-center gap-1 text-xs',
                              item.urgency === 'high'
                                ? 'text-danger'
                                : item.urgency === 'medium'
                                ? 'text-orange'
                                : 'text-ink-400'
                            )}
                          >
                            {item.urgency === 'high' && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {item.urgency !== 'high' && <Clock className="h-3 w-3" />}
                            {item.timeLabel}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-ink-400">{item.subtitle}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.category === 'reschedule' && (
                          <>
                            <button
                              onClick={() => handleConfirm(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-lime/15 px-3 py-1 text-xs font-medium text-lime transition-all hover:bg-lime/25"
                            >
                              <Check className="h-3 w-3" />
                              确认
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-ink-700 px-3 py-1 text-xs font-medium text-ink-300 transition-all hover:bg-danger/15 hover:text-danger"
                            >
                              <X className="h-3 w-3" />
                              取消
                            </button>
                          </>
                        )}

                        {item.category === 'leave' && (
                          <>
                            <button
                              onClick={() => handleApproveLeave(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-info/15 px-3 py-1 text-xs font-medium text-info transition-all hover:bg-info/25"
                            >
                              <Check className="h-3 w-3" />
                              批准
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-ink-700 px-3 py-1 text-xs font-medium text-ink-300 transition-all hover:bg-danger/15 hover:text-danger"
                            >
                              <X className="h-3 w-3" />
                              拒绝
                            </button>
                          </>
                        )}

                        {item.category === 'expiring' && (
                          <button
                            onClick={() => handleRemind(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-orange/15 px-3 py-1 text-xs font-medium text-orange transition-all hover:bg-orange/25"
                          >
                            <Clock className="h-3 w-3" />
                            发送提醒
                          </button>
                        )}

                        <button className="ml-auto inline-flex items-center gap-0.5 text-xs text-ink-500 transition-all hover:text-orange">
                          详情
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
