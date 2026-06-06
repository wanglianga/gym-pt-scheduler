import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout';
import { MemberCard, MemberSearch } from '@/components/member';
import { useMemberStore } from '@/store/useMemberStore';
import type { Member, MemberLevel } from '@/types';
import { MEMBER_LEVEL_LABEL } from '@/types';

const PAGE_SIZE = 6;

const LEVEL_FILTERS: (MemberLevel | 'all')[] = ['all', 'basic', 'silver', 'gold', 'platinum', 'diamond'];

const LEVEL_FILTER_LABEL: Record<MemberLevel | 'all', string> = {
  all: '全部',
  basic: '普通',
  silver: '银卡',
  gold: '金卡',
  platinum: '铂金',
  diamond: '钻石',
};

const levelBadgeClass: Record<string, string> = {
  all: 'bg-orange text-white shadow-glow-orange',
  basic: 'bg-ink-600 text-ink-200 border border-ink-500',
  silver: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
  gold: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  platinum: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  diamond: 'bg-orange/20 text-orange border border-orange/40',
};

export default function Members() {
  const navigate = useNavigate();
  const loadMembers = useMemberStore((s) => s.loadMembers);
  const members = useMemberStore((s) => s.members);

  const [currentLevel, setCurrentLevel] = useState<MemberLevel | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (members.length === 0) {
      loadMembers();
    }
  }, [members.length, loadMembers]);

  const filteredMembers = useMemo(() => {
    if (currentLevel === 'all') return members;
    return members.filter((m) => m.level === currentLevel);
  }, [members, currentLevel]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleViewDetail = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleSelectMember = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleLevelChange = (level: MemberLevel | 'all') => {
    setCurrentLevel(level);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">
          共 <span className="text-ink-100 font-medium">{filteredMembers.length}</span> 位会员
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-ink-700 text-ink-300 hover:text-ink-100 hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                currentPage === page
                  ? 'bg-orange text-white shadow-glow-orange'
                  : 'bg-ink-700 text-ink-300 hover:text-ink-100 hover:bg-ink-600'
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-ink-700 text-ink-300 hover:text-ink-100 hover:bg-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-ink-50 tracking-wide">
              会员管理
            </h1>
            <p className="text-sm text-ink-400 mt-1">查看和管理所有会员档案</p>
          </div>
          <button className="btn-primary gap-2 w-full lg:w-auto">
            <UserPlus className="w-4 h-4" />
            新建会员
          </button>
        </div>

        <div className="card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <MemberSearch onSelect={handleSelectMember} />
            </div>
            <div className="flex gap-1.5 flex-wrap bg-ink-900/50 p-1 rounded-lg w-fit">
              {LEVEL_FILTERS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    currentLevel === level
                      ? levelBadgeClass[level]
                      : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/50'
                  )}
                >
                  {LEVEL_FILTER_LABEL[level]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {paginatedMembers.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-700 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-ink-500" />
            </div>
            <p className="text-ink-300">暂无会员数据</p>
            <p className="text-ink-500 text-sm mt-1">
              {currentLevel !== 'all'
                ? `暂无${MEMBER_LEVEL_LABEL[currentLevel]}会员`
                : '点击右上角"新建会员"添加第一位会员'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}

        <div className="card p-4">
          {renderPagination()}
        </div>
      </div>
    </AppLayout>
  );
}
