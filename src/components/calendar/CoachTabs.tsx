import { useEffect } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachStore } from '@/store/useCoachStore';
import { SPECIALTY_LABEL } from '@/types';

export default function CoachTabs() {
  const { coaches, loading, selectedCoachId, loadCoaches, setSelectedCoach } = useCoachStore();

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  if (loading && coaches.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="shimmer-effect h-20 w-48 flex-shrink-0 rounded-xl bg-ink-800 border border-ink-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {coaches.map((coach) => {
        const isSelected = selectedCoachId === coach.id;
        const topSpecialties = coach.specialties.slice(0, 2);

        return (
          <button
            key={coach.id}
            onClick={() => setSelectedCoach(coach.id)}
            className={cn(
              'group flex flex-shrink-0 items-center gap-3 rounded-xl border p-3 transition-all duration-300',
              isSelected
                ? 'border-orange bg-orange/10 shadow-glow-orange'
                : 'border-ink-700 bg-ink-800 hover:border-orange/60 hover:bg-ink-700'
            )}
          >
            <div
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden',
                isSelected ? 'ring-2 ring-orange' : 'ring-2 ring-ink-600'
              )}
            >
              {coach.avatar ? (
                <img src={coach.avatar} alt={coach.name} className="h-full w-full object-cover" />
              ) : (
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center',
                    isSelected ? 'bg-orange/30' : 'bg-ink-700'
                  )}
                >
                  <User className="h-6 w-6 text-ink-200" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span
                className={cn(
                  'font-heading text-base font-semibold tracking-wide',
                  isSelected ? 'text-orange' : 'text-ink-100 group-hover:text-orange'
                )}
              >
                {coach.name}
              </span>
              <div className="mt-1 flex gap-1">
                {topSpecialties.map((s) => (
                  <span
                    key={s}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      isSelected
                        ? 'bg-orange/20 text-orange'
                        : 'bg-ink-700 text-ink-300 group-hover:bg-orange/10 group-hover:text-orange'
                    )}
                  >
                    {SPECIALTY_LABEL[s]}
                  </span>
                ))}
                {coach.specialties.length > 2 && (
                  <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[10px] text-ink-400">
                    +{coach.specialties.length - 2}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
