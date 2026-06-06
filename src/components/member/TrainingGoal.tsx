import { useMemo } from 'react';
import {
  AlertTriangle,
  Target,
  Dumbbell,
  CheckCircle2,
  Circle,
  Flame,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member } from '@/types';

interface TrainingGoalProps {
  member: Member;
  className?: string;
}

interface GoalProgress {
  text: string;
  progress: number;
}

export default function TrainingGoal({ member, className }: TrainingGoalProps) {
  const hasInjuries = member.injuries && member.injuries.length > 0;

  const goalProgress = useMemo<GoalProgress[]>(() => {
    if (!member.trainingGoals || member.trainingGoals.length === 0) {
      return [];
    }
    return member.trainingGoals.map((goal, idx) => ({
      text: goal,
      progress: Math.min(100, 30 + idx * 20 + Math.floor(Math.random() * 20)),
    }));
  }, [member.trainingGoals]);

  return (
    <div className={cn('card overflow-hidden', className)}>
      {hasInjuries && (
        <div className="bg-danger/10 border-b border-danger/30 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center flex-shrink-0 border border-danger/30">
              <ShieldAlert className="w-5 h-5 text-danger" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-heading font-semibold text-danger tracking-wide">伤病限制</h4>
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <ul className="space-y-1.5">
                {member.injuries.map((injury, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-danger/90"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                    <span>{injury}</span>
                  </li>
                ))}
              </ul>
              {member.notes && (
                <p className="mt-3 text-xs text-danger/70 bg-danger/5 rounded-md px-3 py-2 border border-danger/20">
                  <span className="font-medium">注意：</span>
                  {member.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-orange" />
          <h3 className="text-lg font-heading font-semibold text-ink-50 tracking-wide">
            本周期训练重点
          </h3>
        </div>

        {!member.trainingGoals || member.trainingGoals.length === 0 ? (
          <div className="py-8 text-center text-ink-400">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无训练目标</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goalProgress.map((goal, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {goal.progress >= 80 ? (
                      <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                    ) : goal.progress >= 40 ? (
                      <TrendingUp className="w-4 h-4 text-orange flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-ink-500 flex-shrink-0" />
                    )}
                    <span className="text-sm text-ink-100 truncate">{goal.text}</span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-mono font-medium ml-2 flex-shrink-0',
                      goal.progress >= 80
                        ? 'text-lime'
                        : goal.progress >= 40
                        ? 'text-orange'
                        : 'text-ink-400'
                    )}
                  >
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      goal.progress >= 80
                        ? 'bg-gradient-to-r from-lime-500 to-lime shadow-glow-lime'
                        : goal.progress >= 40
                        ? 'bg-gradient-to-r from-orange to-orange-500 shadow-glow-orange'
                        : 'bg-gradient-to-r from-ink-500 to-ink-400'
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {goalProgress.length > 0 && (
          <div className="mt-5 pt-4 border-t border-ink-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-ink-300">
                <Flame className="w-4 h-4 text-orange" />
                <span>整体完成度</span>
              </div>
              <span className="font-heading font-bold text-lg text-orange">
                {Math.round(
                  goalProgress.reduce((acc, g) => acc + g.progress, 0) / goalProgress.length
                )}
                %
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
