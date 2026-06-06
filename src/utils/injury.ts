import type { Member, BodyMetric, CoachSpecialty, InjuryAlert, InjuryType, InjuryRiskAssessment } from '../types';

const INJURY_KEYWORDS: Record<InjuryType, string[]> = {
  knee: ['膝', '膝盖', '半月板', '十字韧带', '髌', 'ACL', 'MCL', '膝关节'],
  back: ['腰', '腰椎', '椎间盘', '腰肌', '腰背', '脊柱'],
  heart: ['心率', '心律', '心脏', '心', '血压', '高血', '心律不齐', '早搏', '房颤', '心血管'],
  shoulder: ['肩', '肩周炎', '肩袖', '肩关节'],
  ankle: ['脚踝', '踝关节', '脚踝扭伤'],
  neck: ['颈', '颈椎'],
  other: [],
};

const INJURY_LABEL: Record<InjuryType, string> = {
  knee: '膝关节损伤',
  back: '腰部损伤',
  heart: '心率/心血管异常',
  shoulder: '肩部损伤',
  ankle: '脚踝损伤',
  neck: '颈椎问题',
  other: '其他伤病',
};

export const HIGH_INTENSITY_SPECIALTIES: CoachSpecialty[] = ['hiit', 'boxing', 'strength', 'cardio'];

export const UNSUITABLE_MAP: Record<InjuryType, CoachSpecialty[]> = {
  knee: ['hiit', 'boxing', 'strength', 'cardio'],
  back: ['hiit', 'boxing', 'strength'],
  heart: ['hiit', 'boxing', 'cardio', 'strength'],
  shoulder: ['boxing', 'strength'],
  ankle: ['hiit', 'boxing', 'cardio'],
  neck: ['boxing', 'hiit'],
  other: [],
};

export const RECOMMENDED_MAP: Record<InjuryType, CoachSpecialty[]> = {
  knee: ['rehab', 'yoga', 'pilates', 'nutrition'],
  back: ['yoga', 'pilates', 'rehab', 'nutrition'],
  heart: ['yoga', 'pilates', 'rehab', 'nutrition'],
  shoulder: ['rehab', 'yoga', 'pilates'],
  ankle: ['rehab', 'yoga', 'pilates', 'nutrition'],
  neck: ['yoga', 'pilates', 'rehab'],
  other: [],
};

export const HEART_RATE_HIGH_THRESHOLD = 85;
export const HEART_RATE_LOW_THRESHOLD = 55;

function detectInjuryType(text: string): InjuryType | null {
  const lowerText = text.toLowerCase();
  for (const [type, keywords] of Object.entries(INJURY_KEYWORDS) as [InjuryType, string[]][]) {
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        return type;
      }
    }
  }
  return null;
}

export function analyzeMemberInjuries(member: Member, latestMetric: BodyMetric | null): InjuryAlert[] {
  const alerts: InjuryAlert[] = [];
  const foundTypes = new Set<InjuryType>();

  member.injuries.forEach((injury) => {
    const type = detectInjuryType(injury);
    if (type) {
      foundTypes.add(type);
      alerts.push({
        type,
        label: INJURY_LABEL[type],
        source: 'injuries',
        detail: injury,
      });
    } else if (injury.trim()) {
      alerts.push({
        type: 'other',
        label: injury,
        source: 'injuries',
        detail: injury,
      });
    }
  });

  if (member.notes) {
    const notesType = detectInjuryType(member.notes);
    if (notesType && !foundTypes.has(notesType)) {
      foundTypes.add(notesType);
      alerts.push({
        type: notesType,
        label: INJURY_LABEL[notesType],
        source: 'notes',
        detail: member.notes,
      });
    }
  }

  if (latestMetric) {
    if (latestMetric.restingHeartRate >= HEART_RATE_HIGH_THRESHOLD) {
      if (!foundTypes.has('heart')) {
        foundTypes.add('heart');
        alerts.push({
          type: 'heart',
          label: INJURY_LABEL.heart,
          source: 'metrics',
          detail: `静息心率偏高：${latestMetric.restingHeartRate} bpm（正常范围 60-80 bpm）`,
        });
      }
    } else if (latestMetric.restingHeartRate <= HEART_RATE_LOW_THRESHOLD) {
      if (!foundTypes.has('heart')) {
        foundTypes.add('heart');
        alerts.push({
          type: 'heart',
          label: INJURY_LABEL.heart,
          source: 'metrics',
          detail: `静息心率偏低：${latestMetric.restingHeartRate} bpm（正常范围 60-80 bpm）`,
        });
      }
    }
    if (latestMetric.notes) {
      const metricType = detectInjuryType(latestMetric.notes);
      if (metricType && !foundTypes.has(metricType)) {
        foundTypes.add(metricType);
        alerts.push({
          type: metricType,
          label: INJURY_LABEL[metricType],
          source: 'metrics',
          detail: latestMetric.notes,
        });
      }
    }
  }

  return alerts;
}

export function assessInjuryRisk(
  member: Member,
  latestMetric: BodyMetric | null,
  selectedSpecialty: CoachSpecialty | ''
): InjuryRiskAssessment {
  const alerts = analyzeMemberInjuries(member, latestMetric);
  const hasInjury = alerts.length > 0;

  const unsuitableSpecialties = new Set<CoachSpecialty>();
  alerts.forEach((alert) => {
    UNSUITABLE_MAP[alert.type]?.forEach((s) => unsuitableSpecialties.add(s));
  });

  const isHighIntensitySelected =
    selectedSpecialty !== '' && HIGH_INTENSITY_SPECIALTIES.includes(selectedSpecialty);

  const hasInjuryWithHighIntensityRisk = alerts.some(
    (a) => UNSUITABLE_MAP[a.type]?.includes(selectedSpecialty as CoachSpecialty)
  );

  const requiresAdjustmentNote =
    isHighIntensitySelected && hasInjury && hasInjuryWithHighIntensityRisk;

  return {
    hasInjury,
    alerts,
    unsuitableSpecialties: Array.from(unsuitableSpecialties),
    highIntensitySpecialties: HIGH_INTENSITY_SPECIALTIES,
    isHighIntensitySelected,
    requiresAdjustmentNote,
  };
}

export function getRecommendedSpecialties(alerts: InjuryAlert[]): CoachSpecialty[] {
  const recommended = new Set<CoachSpecialty>();
  alerts.forEach((alert) => {
    RECOMMENDED_MAP[alert.type]?.forEach((s) => recommended.add(s));
  });
  return Array.from(recommended);
}
