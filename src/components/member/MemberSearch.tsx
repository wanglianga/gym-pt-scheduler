import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, User, Phone, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member } from '@/types';
import { MEMBER_LEVEL_LABEL } from '@/types';
import { useMemberStore } from '@/store/useMemberStore';

interface MemberSearchProps {
  onSelect?: (member: Member) => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
  showAllOnFocus?: boolean;
}

const levelBadgeClass: Record<string, string> = {
  basic: 'bg-ink-600 text-ink-200 border border-ink-500',
  silver: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
  gold: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  platinum: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  diamond: 'bg-orange/20 text-orange border border-orange/40',
};

export default function MemberSearch({
  onSelect,
  placeholder = '搜索会员姓名或手机号...',
  maxResults = 8,
  className,
  showAllOnFocus = true,
}: MemberSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const members = useMemberStore((s) => s.members);
  const searchMembers = useMemberStore((s) => s.searchMembers);
  const loadMembers = useMemberStore((s) => s.loadMembers);

  useEffect(() => {
    if (members.length === 0) {
      loadMembers();
    }
  }, [members.length, loadMembers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const trimmed = keyword.trim();
    if (!trimmed && showAllOnFocus) {
      return members.slice(0, maxResults);
    }
    if (!trimmed) return [];
    return searchMembers(trimmed).slice(0, maxResults);
  }, [keyword, members, searchMembers, maxResults, showAllOnFocus]);

  const handleSelect = (member: Member) => {
    setKeyword(member.name);
    setIsOpen(false);
    setFocusedIndex(-1);
    onSelect?.(member);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && results[focusedIndex]) {
        handleSelect(results[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const highlight = (text: string, query: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-orange font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-400" />
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input pl-10 pr-10 py-3"
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 card overflow-hidden animate-slide-down">
          <div className="max-h-96 overflow-y-auto">
            {results.map((member, idx) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-ink-700 last:border-b-0',
                  focusedIndex === idx
                    ? 'bg-orange/10'
                    : 'hover:bg-ink-700/50'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange/30 to-red-500/30 flex items-center justify-center flex-shrink-0 border border-ink-600">
                  <User className="w-5 h-5 text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-medium text-ink-50">
                      {highlight(member.name, keyword)}
                    </span>
                    <span className={cn('badge text-[10px]', levelBadgeClass[member.level])}>
                      {MEMBER_LEVEL_LABEL[member.level]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-sm text-ink-400">
                    <Phone className="w-3 h-3" />
                    <span className="font-mono text-xs">
                      {highlight(member.phone, keyword)}
                    </span>
                  </div>
                </div>
                <ChevronRight className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  focusedIndex === idx ? 'text-orange' : 'text-ink-500'
                )} />
              </button>
            ))}
          </div>
          {results.length >= maxResults && (
            <div className="px-4 py-2 text-xs text-ink-400 text-center border-t border-ink-700 bg-ink-800/50">
              仅显示前 {maxResults} 条结果，请输入更精确的关键词
            </div>
          )}
        </div>
      )}

      {isOpen && keyword.trim() && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 card p-6 text-center animate-slide-down">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-ink-700 flex items-center justify-center">
            <Search className="w-6 h-6 text-ink-400" />
          </div>
          <p className="text-ink-300 text-sm">未找到匹配的会员</p>
          <p className="text-ink-500 text-xs mt-1">请尝试使用姓名或手机号搜索</p>
        </div>
      )}
    </div>
  );
}
