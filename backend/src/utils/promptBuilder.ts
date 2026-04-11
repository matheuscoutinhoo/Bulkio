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
   focus?: string;
   description?: string;
}

export function buildPrompt(
   exercises: Exercise[],
   user: UserContext,
   preferences: GeneratePreferences,
): string {
   const exerciseList = exercises
      .map((e) => `- ID: "${e.id}" | Nome: "${e.name}" | Grupo: ${e.muscleGroup} | Tipo: ${e.type} | Equipamento: ${e.equipment}`)
      .join('\n');

   const goalLabel = user.goal === 'BULK' ? 'Ganho de Massa'
      : user.goal === 'CUT' ? 'Perda de Gordura'
         : user.goal === 'MAINTAIN' ? 'Manutenção'
            : 'Não definido';

   const levelLabel = preferences.level === 'BEGINNER' ? 'Iniciante'
      : preferences.level === 'INTERMEDIATE' ? 'Intermediário'
         : 'Avançado';

   const setsRange = preferences.level === 'BEGINNER' ? '2-3'
      : preferences.level === 'INTERMEDIATE' ? '3-4'
         : '4-5';

   const exercisesPerDay = preferences.level === 'BEGINNER' ? '4-6'
      : preferences.level === 'INTERMEDIATE' ? '5-7'
         : '6-8';

   return `Você é um personal trainer profissional especializado em musculação.

TAREFA: Gere UMA ficha de treino para o seguinte perfil:

PERFIL DO ALUNO:
- Objetivo: ${goalLabel}
- Nível: ${levelLabel}
${user.height ? `- Altura: ${user.height}cm` : ''}
${user.initialWeight ? `- Peso atual: ${user.initialWeight}kg` : ''}
${user.targetWeight ? `- Peso alvo: ${user.targetWeight}kg` : ''}
${preferences.focus ? `- Foco muscular: ${preferences.focus}` : ''}
${preferences.description ? `- Preferências adicionais: ${preferences.description}` : ''}

REGRAS OBRIGATÓRIAS:
1. Use APENAS exercícios da lista fornecida abaixo (use o ID exato).
2. A ficha deve ter de ${exercisesPerDay} exercícios.
3. Cada exercício deve ter de ${setsRange} séries.
4. Reps devem ser string (ex: "8-12", "10", "15-20", "até falha").
5. Descanso em segundos (60-180 para compostos, 45-90 para isolados).
6. Comece com exercícios compostos, depois isolados.
7. Nomeie a ficha descritivamente (ex: "Peito e Tríceps", "Costas e Bíceps").

EXERCÍCIOS DISPONÍVEIS:
${exerciseList}

FORMATO DE RESPOSTA (JSON):
{
  "name": "Nome da Ficha",
  "exercises": [
    {
      "exerciseId": "uuid-do-exercicio",
      "sets": 3,
      "reps": "8-12",
      "restSeconds": 90,
      "order": 0
    }
  ]
}

Responda APENAS com JSON válido, sem markdown, sem explicações.`;
}
