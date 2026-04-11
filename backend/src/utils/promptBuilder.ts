interface Exercise {
   id: string;
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
}

interface GeneratePreferences {
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus: string;
   description?: string;
}

const GOAL_LABELS: Record<string, string> = {
   BULK: 'Massa', CUT: 'Cutting', MAINTAIN: 'Manutenção',
};

const LEVEL_CONFIG: Record<string, { label: string; sets: string; count: string }> = {
   BEGINNER: { label: 'Iniciante', sets: '2-3', count: '4-6' },
   INTERMEDIATE: { label: 'Intermediário', sets: '3-4', count: '5-7' },
   ADVANCED: { label: 'Avançado', sets: '4-5', count: '6-8' },
};

export function buildPrompt(
   exercises: Exercise[],
   user: UserContext,
   preferences: GeneratePreferences,
): string {
   // Compact exercise list: "ID|Nome|Grupo|Tipo|Equip"
   const exerciseList = exercises
      .map((e) => `${e.id}|${e.name}|${e.muscleGroup}|${e.type}|${e.equipment}`)
      .join('\n');

   const lvl = LEVEL_CONFIG[preferences.level];
   const goal = GOAL_LABELS[user.goal ?? ''] ?? 'N/A';

   const profile = [
      `Obj:${goal}`,
      `Nível:${lvl.label}`,
      user.height && `Alt:${user.height}cm`,
      user.initialWeight && `Peso:${user.initialWeight}kg`,
      user.targetWeight && `Alvo:${user.targetWeight}kg`,
      `Foco:${preferences.focus}`,
      preferences.description && `Extra:${preferences.description}`,
   ].filter(Boolean).join(' | ');

   return `Gere 1 ficha de treino. ${lvl.count} exercícios, ${lvl.sets} séries cada. Compostos primeiro.
Use APENAS IDs da lista. Reps como string. Descanso 60-180s compostos, 45-90s isolados.

Aluno: ${profile}

Exercícios (ID|Nome|Grupo|Tipo|Equip):
${exerciseList}

JSON: {"name":"...","exercises":[{"exerciseId":"...","sets":3,"reps":"8-12","restSeconds":90}]}`;
}
