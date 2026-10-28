import { test as base, expect } from '@playwright/test';
import type { CreateWorkoutLogData, UpdateWorkoutLogData, WorkoutLog } from '../src/services/workoutLogService';
import type { OnboardingData, UpdateProfileData } from '../src/services/authService';

export interface TestAccount {
   id: string; username: string; email: string; goal: string | null;
   initialWeight: number | null; targetWeight: number | null; height: number | null;
   onboardingStatus: 'PENDING' | 'COMPLETED' | 'SKIPPED'; createdAt: string;
}
interface TestWeight { id: string; weight: number; date: string; createdAt?: string }
export const user: TestAccount = { id: 'test-user', username: 'Matheus', email: 'matheus@example.test', goal: 'CUT', initialWeight: 84, targetWeight: 72, height: 176, onboardingStatus: 'COMPLETED', createdAt: '2026-01-01T12:00:00Z' };
export const exercises = [
   { id: 'ex-1', name: 'Supino reto com barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-2', name: 'Desenvolvimento de ombros com halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL' },
   { id: 'ex-3', name: 'Remada curvada com barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-4', name: 'Rosca direta', muscleGroup: 'BICEPS', type: 'ISOLATION', equipment: 'BARBELL' },
   { id: 'ex-5', name: 'Agachamento livre', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-6', name: 'Elevação de panturrilhas', muscleGroup: 'CALVES', type: 'ISOLATION', equipment: 'MACHINE' },
   { id: 'ex-7', name: 'Flexão de braços', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT' },
];
export const plans = ['Peito e ombros', 'Costas e bíceps', 'Pernas e panturrilhas'].map((name, index) => ({
   id: `plan-${index + 1}`, name, description: 'Movimentos controlados, foco na execução e progressão consistente.', createdAt: '2026-10-01T12:00:00Z', updatedAt: '2026-10-24T12:00:00Z', _count: { workoutLogs: 4 },
   exercises: exercises.slice(index * 2, index * 2 + 2).map((exercise, order) => ({ id: `pe-${exercise.id}`, exerciseId: exercise.id, exercise, order, sets: 3, reps: '10–12', weight: 40, restSeconds: 90 })),
}));
const weights = Array.from({ length: 12 }, (_, index) => ({ id: `weight-${index}`, weight: Number((84 - index * 0.35).toFixed(1)), date: new Date(Date.UTC(2026, 9, 1 + index * 2, 12)).toISOString() }));
const distribution = { CHEST: 18, BACK: 15, SHOULDERS: 10, BICEPS: 8, TRICEPS: 9, FOREARMS: 4, ABS: 6, TRAPS: 3, GLUTES: 12, LEGS: 20, CALVES: 7 };
export const dashboardStats = {
   weeklyWorkouts: { current: 4, previous: 3 }, streak: 3, totalVolume: 42580, muscleDistribution: distribution,
   bodyWeight: { current: weights.at(-1), history: weights, target: 72, initial: 84, goal: 'CUT' },
   yearlyActivity: { '2026-10-20': 1, '2026-10-22': 1, '2026-10-23': 1, '2026-10-24': 1 },
   personalRecords: [{ id: 'pr-1', weight: 80, reps: 8, date: '2026-10-24T12:00:00Z', exercise: exercises[0] }],
};

function loggedExercises(items: CreateWorkoutLogData['exercises'], prefix: string) {
   return items.map((item, index) => ({
      ...item, id: `${prefix}-ex-${index}`, exercise: exercises.find(exercise => exercise.id === item.exerciseId)!,
      sets: item.sets.map((set, setIndex) => ({ ...set, id: `${prefix}-set-${index}-${setIndex}` })),
   }));
}

export const test = base.extend<{ account: TestAccount; authenticated: boolean; weightRecords: TestWeight[] }>({
   account: [user, { option: true }],
   authenticated: [true, { option: true }],
   weightRecords: [weights, { option: true }],
   page: async ({ page, account, authenticated, weightRecords }, runTest) => {
      await page.addInitScript(({ account, authenticated }) => {
         if (authenticated && !localStorage.getItem('bulkio-auth')) localStorage.setItem('bulkio-auth', JSON.stringify({ state: { user: account, isAuthenticated: true }, version: 0 }));
         if (!localStorage.getItem('bulkio-theme')) localStorage.setItem('bulkio-theme', JSON.stringify({ state: { theme: 'light' }, version: 0 }));
      }, { account, authenticated });
      let profile = { ...account };
      const bodyWeights = [...weightRecords];
      let logs: WorkoutLog[] = (account.onboardingStatus === 'PENDING' ? [] : [false, true, true]).map((isComplete, index) => ({
         id: `log-${index}`, date: `2026-10-${24 - index}T12:00:00Z`, startTime: `2026-10-${24 - index}T12:00:00Z`, endTime: isComplete ? `2026-10-${24 - index}T13:00:00Z` : undefined,
         isComplete, workoutPlan: { id: plans[index].id, name: plans[index].name }, createdAt: '2026-10-24T12:00:00Z',
         exercises: plans[index].exercises.map(item => ({ id: `le-${index}-${item.exerciseId}`, exerciseId: item.exerciseId, order: item.order, exercise: item.exercise, sets: [
            { id: `s-${index}-${item.exerciseId}-1`, setNumber: 1, reps: 12, weight: 40 }, { id: `s-${index}-${item.exerciseId}-2`, setNumber: 2, reps: 10, weight: 47.5 },
         ] })),
      }));
      let updateVersion = 0;
      await page.route('**/api/v1/**', async route => {
         const request = route.request();
         const path = new URL(request.url()).pathname.replace('/api/v1', '');
         let data: unknown = null;
         let status = 200;
         if (path === '/auth/refresh') data = { accessToken: 'local-test-token' };
         else if (path === '/auth/register' || path === '/auth/login') {
            if (path === '/auth/register') {
               const fields = request.postDataJSON() as { username: string; email: string };
               profile = { ...profile, username: fields.username, email: fields.email };
            }
            data = { user: profile, accessToken: 'local-test-token' };
         }
         else if (path === '/auth/profile') {
            if (request.method() === 'PATCH') profile = { ...profile, ...(request.postDataJSON() as UpdateProfileData) };
            data = profile;
         }
         else if (path === '/auth/onboarding') {
            const fields = request.postDataJSON() as OnboardingData;
            if (!bodyWeights.length) bodyWeights.push({ id: 'initial-weight', weight: fields.weight, date: new Date().toISOString(), createdAt: new Date().toISOString() });
            profile = { ...profile, height: fields.height, goal: fields.goal, targetWeight: fields.targetWeight, initialWeight: profile.initialWeight ?? bodyWeights[0].weight, onboardingStatus: 'COMPLETED' };
            data = profile;
         }
         else if (path === '/auth/onboarding/skip') {
            if (profile.onboardingStatus === 'PENDING') profile.onboardingStatus = 'SKIPPED';
            data = profile;
         }
         else if (path === '/auth/password') {
            if (request.postDataJSON().currentPassword !== 'test-current-password') return route.fulfill({ status: 400, json: { success: false, data: null, message: 'Senha atual incorreta.' } });
         } else if (path === '/dashboard/stats') data = {
            ...dashboardStats,
            ...(account.onboardingStatus === 'PENDING' ? { weeklyWorkouts: { current: 0, previous: 0 }, streak: 0, totalVolume: 0, muscleDistribution: {}, yearlyActivity: {}, personalRecords: [] } : {}),
            bodyWeight: { history: [...bodyWeights].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)), current: [...bodyWeights].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0] ?? null, target: profile.targetWeight, initial: profile.initialWeight, goal: profile.goal },
         };
         else if (path.startsWith('/dashboard/exercise-progression/')) data = weights.map((item, index) => ({ date: item.date, maxWeight: 40 + index * 2.5, totalVolume: 1200 + index * 150, sets: [{ setNumber: 1, reps: 10, weight: 40 + index * 2.5 }] }));
         else if (path === '/exercises') data = exercises;
         else if (path === '/workouts') data = account.onboardingStatus === 'PENDING' ? [] : plans;
         else if (path.startsWith('/workouts/')) data = plans.find(plan => plan.id === path.split('/').at(-1));
         else if (path === '/body-weight') data = [...bodyWeights].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
         else if (path === '/workout-logs' && request.method() === 'POST') {
            const body = request.postDataJSON() as CreateWorkoutLogData;
            const plan = plans.find(item => item.id === body.workoutPlanId);
            const created: WorkoutLog = {
               id: 'new-workout', date: body.date ?? new Date().toISOString(), startTime: body.startTime ?? undefined, endTime: body.endTime ?? undefined,
               isComplete: body.isComplete ?? false, notes: body.notes, createdAt: new Date().toISOString(),
               workoutPlan: plan ? { id: plan.id, name: plan.name } : undefined, exercises: loggedExercises(body.exercises, 'new'),
            };
            logs = [created, ...logs]; data = created;
         } else if (path === '/workout-logs') data = logs;
         else if (path.startsWith('/workout-logs/exercise-history/')) data = null;
         else if (path.startsWith('/workout-logs/') && request.method() === 'PATCH') {
            const previous = logs.find(log => log.id === path.split('/').at(-1));
            if (!previous) return route.fulfill({ status: 404, json: { success: false, message: 'Treino não encontrado' } });
            const body = request.postDataJSON() as UpdateWorkoutLogData;
            const updated: WorkoutLog = {
               ...previous, ...body, notes: body.notes ?? previous.notes, startTime: body.startTime ?? previous.startTime, endTime: body.endTime ?? previous.endTime,
               exercises: body.exercises ? loggedExercises(body.exercises, `update-${++updateVersion}`) : previous.exercises,
            };
            logs = logs.map(log => log.id === updated.id ? updated : log); data = updated;
         }
         else { status = 404; }
         await route.fulfill({ status, json: { success: status < 400, data, pagination: { page: 1, limit: 20, total: Array.isArray(data) ? data.length : 1, totalPages: 1 } } });
      });
      await runTest(page);
   },
});
export { expect };
