import { test as base, expect } from '@playwright/test';

export const user = { id: 'test-user', username: 'Matheus', email: 'matheus@example.test', goal: 'CUT', initialWeight: 84, targetWeight: 72, height: 176, createdAt: '2026-01-01T12:00:00Z' };
const exercises = [
   { id: 'ex-1', name: 'Supino reto com barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-2', name: 'Desenvolvimento de ombros com halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL' },
   { id: 'ex-3', name: 'Remada curvada com barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-4', name: 'Rosca direta', muscleGroup: 'BICEPS', type: 'ISOLATION', equipment: 'BARBELL' },
   { id: 'ex-5', name: 'Agachamento livre', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-6', name: 'Elevação de panturrilhas', muscleGroup: 'CALVES', type: 'ISOLATION', equipment: 'MACHINE' },
];
export const plans = ['Peito e ombros', 'Costas e bíceps', 'Pernas e panturrilhas'].map((name, index) => ({
   id: `plan-${index + 1}`, name, description: 'Movimentos controlados, foco na execução e progressão consistente.', createdAt: '2026-10-01T12:00:00Z', updatedAt: '2026-10-24T12:00:00Z', _count: { workoutLogs: 4 },
   exercises: exercises.slice(index * 2, index * 2 + 2).map((exercise, order) => ({ id: `pe-${exercise.id}`, exerciseId: exercise.id, exercise, order, sets: 3, reps: '10–12', weight: 40, restSeconds: 90 })),
}));
const weights = Array.from({ length: 12 }, (_, index) => ({ id: `weight-${index}`, weight: Number((84 - index * 0.35).toFixed(1)), date: new Date(Date.UTC(2026, 9, 1 + index * 2, 12)).toISOString() }));
const distribution = { CHEST: 18, BACK: 15, SHOULDERS: 10, BICEPS: 8, TRICEPS: 9, FOREARMS: 4, ABS: 6, TRAPS: 3, GLUTES: 12, LEGS: 20, CALVES: 7 };

export const test = base.extend({
   page: async ({ page }, runTest) => {
      await page.addInitScript(account => {
         localStorage.setItem('bulkio-auth', JSON.stringify({ state: { user: account, isAuthenticated: true }, version: 0 }));
         localStorage.setItem('bulkio-theme', JSON.stringify({ state: { theme: 'light' }, version: 0 }));
      }, user);
      let logs = [false, true, true].map((isComplete, index) => ({
         id: `log-${index}`, date: `2026-10-${24 - index}T12:00:00Z`, startTime: `2026-10-${24 - index}T12:00:00Z`, endTime: isComplete ? `2026-10-${24 - index}T13:00:00Z` : null,
         isComplete, workoutPlan: { id: plans[index].id, name: plans[index].name }, createdAt: '2026-10-24T12:00:00Z',
         exercises: plans[index].exercises.map(item => ({ id: `le-${index}-${item.exerciseId}`, exerciseId: item.exerciseId, order: item.order, exercise: item.exercise, sets: [
            { id: `s-${index}-${item.exerciseId}-1`, setNumber: 1, reps: 12, weight: 40 }, { id: `s-${index}-${item.exerciseId}-2`, setNumber: 2, reps: 10, weight: 47.5 },
         ] })),
      }));
      await page.route('**/api/v1/**', async route => {
         const request = route.request();
         const path = new URL(request.url()).pathname.replace('/api/v1', '');
         let data: unknown = null;
         let status = 200;
         if (path === '/auth/refresh') data = { accessToken: 'local-test-token' };
         else if (path === '/auth/profile') data = user;
         else if (path === '/auth/password') {
            if (request.postDataJSON().currentPassword !== 'test-current-password') return route.fulfill({ status: 400, json: { success: false, data: null, message: 'Senha atual incorreta.' } });
         } else if (path === '/dashboard/stats') data = {
            weeklyWorkouts: { current: 4, previous: 3 }, streak: 3, totalVolume: 42580, muscleDistribution: distribution,
            bodyWeight: { current: weights.at(-1), history: weights, target: 72, initial: 84, goal: 'CUT' },
            yearlyActivity: { '2026-10-20': 1, '2026-10-22': 1, '2026-10-23': 1, '2026-10-24': 1 },
            personalRecords: [{ id: 'pr-1', weight: 80, reps: 8, date: '2026-10-24T12:00:00Z', exercise: exercises[0] }],
         };
         else if (path.startsWith('/dashboard/exercise-progression/')) data = weights.map((item, index) => ({ date: item.date, maxWeight: 40 + index * 2.5, totalVolume: 1200 + index * 150, sets: [{ setNumber: 1, reps: 10, weight: 40 + index * 2.5 }] }));
         else if (path === '/workouts') data = plans;
         else if (path.startsWith('/workouts/')) data = plans.find(plan => plan.id === path.split('/').at(-1));
         else if (path === '/body-weight') data = [...weights].reverse();
         else if (path === '/workout-logs' && request.method() === 'POST') {
            const body = request.postDataJSON();
            const plan = plans.find(item => item.id === body.workoutPlanId)!;
            const created = { ...logs[0], ...body, id: 'new-workout', workoutPlan: { id: plan.id, name: plan.name }, exercises: [] };
            logs = [created, ...logs]; data = created;
         } else if (path === '/workout-logs') data = logs;
         else if (path.startsWith('/workout-logs/exercise-history/')) data = null;
         else { status = 404; }
         await route.fulfill({ status, json: { success: status < 400, data, pagination: { page: 1, limit: 20, total: Array.isArray(data) ? data.length : 1, totalPages: 1 } } });
      });
      await runTest(page);
   },
});
export { expect };
