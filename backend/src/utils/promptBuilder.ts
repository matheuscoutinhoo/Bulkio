interface Exercise {
   index: number;
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
}

interface UserContext {
   goal: string | null;
   initialWeight: number | null;
   targetWeight: number | null;
   height: number | null;
   currentWeight: number | null;
   weeklyFrequency: number;
   muscleDistribution: Record<string, number>;
   relevantPRs: { name: string; weight: number; reps: number }[];
}

interface GeneratePreferences {
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus: string;
   description?: string;
}

const GOAL_LABELS: Record<string, string> = {
   BULK: 'M', CUT: 'C', MAINTAIN: 'Ma',
};

const LEVEL_CONFIG: Record<string, { label: string; sets: string; count: string }> = {
   BEGINNER: { label: 'Ini', sets: '2-3', count: '4-6' },
   INTERMEDIATE: { label: 'Int', sets: '3-4', count: '5-7' },
   ADVANCED: { label: 'Av', sets: '4-5', count: '6-8' },
};

const GROUP_ABBR: Record<string, string> = {
   CHEST: 'Pe', BACK: 'Co', LEGS: 'Pr', SHOULDERS: 'Om',
   BICEPS: 'Bi', TRICEPS: 'Tr', ABS: 'Ab', GLUTES: 'Gl',
   CALVES: 'Pa', FOREARMS: 'An', TRAPS: 'Tp',
};

const TYPE_ABBR: Record<string, string> = {
   COMPOUND: 'C', ISOLATION: 'I',
};

const EQUIP_ABBR: Record<string, string> = {
   BARBELL: 'B', DUMBBELL: 'H', CABLE: 'Ca', MACHINE: 'M',
   BODYWEIGHT: 'P', SMITH_MACHINE: 'S', EZ_BAR: 'E', OTHER: 'O',
};

export function buildPrompt(
   exercises: Exercise[],
   user: UserContext,
   preferences: GeneratePreferences,
): string {
   const exerciseList = exercises
      .map((e) => `${e.index}|${e.name}|${GROUP_ABBR[e.muscleGroup] ?? e.muscleGroup}|${TYPE_ABBR[e.type] ?? e.type}|${EQUIP_ABBR[e.equipment] ?? e.equipment}`)
      .join('\n');

   const lvl = LEVEL_CONFIG[preferences.level];
   const goal = GOAL_LABELS[user.goal ?? ''];

   const profile = [
      goal && `O:${goal}`,
      `N:${lvl.label}`,
      user.height && `A:${user.height}`,
      user.initialWeight && `P:${user.initialWeight}`,
      user.currentWeight && `PA:${user.currentWeight}`,
      user.targetWeight && `Al:${user.targetWeight}`,
      user.weeklyFrequency > 0 && `Fr:${user.weeklyFrequency}`,
      `F:${preferences.focus}`,
      preferences.description && `+:${preferences.description}`,
   ].filter(Boolean).join('|');

   const volEntries = Object.entries(user.muscleDistribution)
      .filter(([, sets]) => sets > 0)
      .map(([group, sets]) => `${GROUP_ABBR[group] ?? group}${sets}`)
      .join(',');

   const prsFormatted = user.relevantPRs
      .slice(0, 5)
      .map((p) => `${p.name}/${p.weight}x${p.reps}`)
      .join(',');

   const hasContext = !!(volEntries || prsFormatted);

   const lines = [
      `Ficha: ${lvl.count} exerc, ${lvl.sets} séries. Compostos 1º.`,
      '# da lista apenas. Reps=str. Desc 60-180 comp,45-90 isol. w=carga kg sugerida baseada em PR/nível.',
   ];

   if (hasContext) lines.push('Priorizar déficits(V), carga~PR.');

   lines.push(profile);

   if (volEntries) lines.push(`V:${volEntries}`);
   if (prsFormatted) lines.push(`PR:${prsFormatted}`);

   lines.push('#|Nome|G|T|E');
   lines.push(exerciseList);
   lines.push('Responda SOMENTE com JSON neste formato exato, sem texto extra:');
   lines.push('{"e":[{"i":0,"s":3,"r":"8-12","d":90,"w":40}]}');
   lines.push('i=índice da lista,s=séries,r=reps(string),d=descanso seg,w=carga kg.');

   return lines.join('\n');
}
