import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
   console.log('🌱 Seeding test data...');

   // 1. Find the main user
   const user = await prisma.user.findUnique({ where: { email: 'matheusfcneto@gmail.com' } });
   if (!user) throw new Error('User matheusfcneto@gmail.com not found');

   // Update profile for testing
   await prisma.user.update({
      where: { id: user.id },
      data: { goal: 'BULK', initialWeight: 75, targetWeight: 82, height: 178 },
   });
   console.log(`✅ User: ${user.username} (${user.id})`);

   // 2. Get exercises by name for realistic workout plans
   const exerciseNames = [
      // Push day
      'Supino Reto com Barra',
      'Supino Inclinado com Halteres',
      'Crossover na Polia',
      'Desenvolvimento com Halteres',
      'Elevação Lateral',
      'Tríceps na Polia',
      'Tríceps Testa com Barra',
      // Pull day
      'Barra Fixa (Pegada Pronada)',
      'Remada Curvada com Barra',
      'Puxada Frontal',
      'Remada Baixa no Cabo',
      'Rosca Direta com Barra',
      'Rosca Alternada com Halteres',
      'Rosca Martelo',
      // Legs day
      'Agachamento Livre com Barra',
      'Leg Press 45 Graus',
      'Cadeira Extensora',
      'Mesa Flexora',
      'Panturrilha no Leg Press',
      'Stiff com Barra',
      'Afundo com Halteres',
   ];

   // Also check for alternate names
   const NAME_ALIASES: Record<string, string> = {
      'Afundo com Halteres': 'Passada com Halteres',
      'Elevação Lateral com Halteres': 'Elevação Lateral',
      'Tríceps Testa com Barra EZ': 'Tríceps Testa com Barra',
      'Leg Press 45°': 'Leg Press 45 Graus',
   };

   const resolvedNames = exerciseNames.map((n) => NAME_ALIASES[n] ?? n);

   const exercises = await prisma.exercise.findMany({
      where: { name: { in: resolvedNames } },
   });

   const exMap = new Map(exercises.map((e) => [e.name, e]));
   // Also map aliases
   for (const [alias, real] of Object.entries(NAME_ALIASES)) {
      const ex = exMap.get(real);
      if (ex) exMap.set(alias, ex);
   }

   const getEx = (name: string) => {
      const ex = exMap.get(name);
      if (!ex) throw new Error(`Exercise not found: ${name}`);
      return ex;
   };

   // 3. Create 3 workout plans: Push, Pull, Legs
   const pushPlan = await prisma.workoutPlan.create({
      data: {
         name: 'Push - Peito, Ombro, Tríceps',
         userId: user.id,
         exercises: {
            create: [
               { exerciseId: getEx('Supino Reto com Barra').id, sets: 4, reps: '8-10', restSeconds: 120, weight: 70, order: 0 },
               { exerciseId: getEx('Supino Inclinado com Halteres').id, sets: 4, reps: '10-12', restSeconds: 90, weight: 26, order: 1 },
               { exerciseId: getEx('Crossover na Polia').id, sets: 3, reps: '12-15', restSeconds: 60, weight: 15, order: 2 },
               { exerciseId: getEx('Desenvolvimento com Halteres').id, sets: 4, reps: '8-10', restSeconds: 90, weight: 20, order: 3 },
               { exerciseId: getEx('Elevação Lateral com Halteres').id, sets: 3, reps: '12-15', restSeconds: 60, weight: 10, order: 4 },
               { exerciseId: getEx('Tríceps na Polia').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 25, order: 5 },
               { exerciseId: getEx('Tríceps Testa com Barra EZ').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 20, order: 6 },
            ],
         },
      },
   });
   console.log(`✅ Plan: ${pushPlan.name}`);

   const pullPlan = await prisma.workoutPlan.create({
      data: {
         name: 'Pull - Costas, Bíceps',
         userId: user.id,
         exercises: {
            create: [
               { exerciseId: getEx('Barra Fixa (Pegada Pronada)').id, sets: 4, reps: '6-10', restSeconds: 120, weight: 0, order: 0 },
               { exerciseId: getEx('Remada Curvada com Barra').id, sets: 4, reps: '8-10', restSeconds: 90, weight: 60, order: 1 },
               { exerciseId: getEx('Puxada Frontal').id, sets: 4, reps: '10-12', restSeconds: 90, weight: 50, order: 2 },
               { exerciseId: getEx('Remada Baixa no Cabo').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 45, order: 3 },
               { exerciseId: getEx('Rosca Direta com Barra').id, sets: 3, reps: '8-10', restSeconds: 60, weight: 30, order: 4 },
               { exerciseId: getEx('Rosca Alternada com Halteres').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 14, order: 5 },
               { exerciseId: getEx('Rosca Martelo').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 12, order: 6 },
            ],
         },
      },
   });
   console.log(`✅ Plan: ${pullPlan.name}`);

   const legsPlan = await prisma.workoutPlan.create({
      data: {
         name: 'Legs - Pernas e Panturrilha',
         userId: user.id,
         exercises: {
            create: [
               { exerciseId: getEx('Agachamento Livre com Barra').id, sets: 4, reps: '6-8', restSeconds: 180, weight: 80, order: 0 },
               { exerciseId: getEx('Leg Press 45°').id, sets: 4, reps: '10-12', restSeconds: 120, weight: 180, order: 1 },
               { exerciseId: getEx('Afundo com Halteres').id, sets: 3, reps: '10-12', restSeconds: 90, weight: 16, order: 2 },
               { exerciseId: getEx('Cadeira Extensora').id, sets: 3, reps: '12-15', restSeconds: 60, weight: 40, order: 3 },
               { exerciseId: getEx('Mesa Flexora').id, sets: 3, reps: '10-12', restSeconds: 60, weight: 35, order: 4 },
               { exerciseId: getEx('Stiff com Barra').id, sets: 3, reps: '10-12', restSeconds: 90, weight: 50, order: 5 },
               { exerciseId: getEx('Panturrilha no Leg Press').id, sets: 4, reps: '15-20', restSeconds: 45, weight: 120, order: 6 },
            ],
         },
      },
   });
   console.log(`✅ Plan: ${legsPlan.name}`);

   // 4. Create 7 days of workout logs (Push/Pull/Legs/Rest/Push/Pull/Legs)
   const today = new Date();
   today.setHours(12, 0, 0, 0);

   interface WorkoutDay {
      dayOffset: number;
      plan: typeof pushPlan;
      exercises: { name: string; sets: { reps: number; weight: number }[] }[];
   }

   const workoutDays: WorkoutDay[] = [
      // Day -6: Push (Monday)
      {
         dayOffset: -6,
         plan: pushPlan,
         exercises: [
            { name: 'Supino Reto com Barra', sets: [{ reps: 10, weight: 70 }, { reps: 9, weight: 70 }, { reps: 8, weight: 72.5 }, { reps: 7, weight: 72.5 }] },
            { name: 'Supino Inclinado com Halteres', sets: [{ reps: 12, weight: 26 }, { reps: 11, weight: 26 }, { reps: 10, weight: 26 }, { reps: 9, weight: 28 }] },
            { name: 'Crossover na Polia', sets: [{ reps: 15, weight: 15 }, { reps: 14, weight: 15 }, { reps: 12, weight: 17.5 }] },
            { name: 'Desenvolvimento com Halteres', sets: [{ reps: 10, weight: 20 }, { reps: 9, weight: 20 }, { reps: 8, weight: 22 }, { reps: 8, weight: 22 }] },
            { name: 'Elevação Lateral com Halteres', sets: [{ reps: 15, weight: 10 }, { reps: 13, weight: 10 }, { reps: 12, weight: 10 }] },
            { name: 'Tríceps na Polia', sets: [{ reps: 12, weight: 25 }, { reps: 11, weight: 25 }, { reps: 10, weight: 27.5 }] },
            { name: 'Tríceps Testa com Barra EZ', sets: [{ reps: 12, weight: 20 }, { reps: 10, weight: 20 }, { reps: 10, weight: 22 }] },
         ],
      },
      // Day -5: Pull (Tuesday)
      {
         dayOffset: -5,
         plan: pullPlan,
         exercises: [
            { name: 'Barra Fixa (Pegada Pronada)', sets: [{ reps: 10, weight: 0 }, { reps: 8, weight: 0 }, { reps: 7, weight: 0 }, { reps: 6, weight: 0 }] },
            { name: 'Remada Curvada com Barra', sets: [{ reps: 10, weight: 60 }, { reps: 9, weight: 60 }, { reps: 8, weight: 65 }, { reps: 8, weight: 65 }] },
            { name: 'Puxada Frontal', sets: [{ reps: 12, weight: 50 }, { reps: 11, weight: 50 }, { reps: 10, weight: 52.5 }, { reps: 9, weight: 52.5 }] },
            { name: 'Remada Baixa no Cabo', sets: [{ reps: 12, weight: 45 }, { reps: 11, weight: 45 }, { reps: 10, weight: 47.5 }] },
            { name: 'Rosca Direta com Barra', sets: [{ reps: 10, weight: 30 }, { reps: 9, weight: 30 }, { reps: 8, weight: 32 }] },
            { name: 'Rosca Alternada com Halteres', sets: [{ reps: 12, weight: 14 }, { reps: 10, weight: 14 }, { reps: 10, weight: 14 }] },
            { name: 'Rosca Martelo', sets: [{ reps: 12, weight: 12 }, { reps: 11, weight: 12 }, { reps: 10, weight: 14 }] },
         ],
      },
      // Day -4: Legs (Wednesday)
      {
         dayOffset: -4,
         plan: legsPlan,
         exercises: [
            { name: 'Agachamento Livre com Barra', sets: [{ reps: 8, weight: 80 }, { reps: 7, weight: 80 }, { reps: 6, weight: 85 }, { reps: 6, weight: 85 }] },
            { name: 'Leg Press 45°', sets: [{ reps: 12, weight: 180 }, { reps: 11, weight: 180 }, { reps: 10, weight: 200 }, { reps: 10, weight: 200 }] },
            { name: 'Afundo com Halteres', sets: [{ reps: 12, weight: 16 }, { reps: 10, weight: 16 }, { reps: 10, weight: 18 }] },
            { name: 'Cadeira Extensora', sets: [{ reps: 15, weight: 40 }, { reps: 13, weight: 40 }, { reps: 12, weight: 42.5 }] },
            { name: 'Mesa Flexora', sets: [{ reps: 12, weight: 35 }, { reps: 11, weight: 35 }, { reps: 10, weight: 37.5 }] },
            { name: 'Stiff com Barra', sets: [{ reps: 12, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 55 }] },
            { name: 'Panturrilha no Leg Press', sets: [{ reps: 20, weight: 120 }, { reps: 18, weight: 120 }, { reps: 16, weight: 130 }, { reps: 15, weight: 130 }] },
         ],
      },
      // Day -3: Rest (Thursday) - no workout
      // Day -2: Push (Friday)
      {
         dayOffset: -2,
         plan: pushPlan,
         exercises: [
            { name: 'Supino Reto com Barra', sets: [{ reps: 10, weight: 72.5 }, { reps: 9, weight: 72.5 }, { reps: 8, weight: 75 }, { reps: 7, weight: 75 }] },
            { name: 'Supino Inclinado com Halteres', sets: [{ reps: 12, weight: 28 }, { reps: 11, weight: 28 }, { reps: 10, weight: 28 }, { reps: 9, weight: 28 }] },
            { name: 'Crossover na Polia', sets: [{ reps: 15, weight: 17.5 }, { reps: 14, weight: 17.5 }, { reps: 12, weight: 17.5 }] },
            { name: 'Desenvolvimento com Halteres', sets: [{ reps: 10, weight: 22 }, { reps: 9, weight: 22 }, { reps: 8, weight: 22 }, { reps: 8, weight: 24 }] },
            { name: 'Elevação Lateral com Halteres', sets: [{ reps: 15, weight: 10 }, { reps: 14, weight: 10 }, { reps: 12, weight: 12 }] },
            { name: 'Tríceps na Polia', sets: [{ reps: 12, weight: 27.5 }, { reps: 11, weight: 27.5 }, { reps: 10, weight: 27.5 }] },
            { name: 'Tríceps Testa com Barra EZ', sets: [{ reps: 12, weight: 22 }, { reps: 10, weight: 22 }, { reps: 10, weight: 22 }] },
         ],
      },
      // Day -1: Pull (Saturday)
      {
         dayOffset: -1,
         plan: pullPlan,
         exercises: [
            { name: 'Barra Fixa (Pegada Pronada)', sets: [{ reps: 10, weight: 0 }, { reps: 9, weight: 0 }, { reps: 8, weight: 0 }, { reps: 7, weight: 0 }] },
            { name: 'Remada Curvada com Barra', sets: [{ reps: 10, weight: 65 }, { reps: 9, weight: 65 }, { reps: 8, weight: 65 }, { reps: 8, weight: 67.5 }] },
            { name: 'Puxada Frontal', sets: [{ reps: 12, weight: 52.5 }, { reps: 11, weight: 52.5 }, { reps: 10, weight: 55 }, { reps: 9, weight: 55 }] },
            { name: 'Remada Baixa no Cabo', sets: [{ reps: 12, weight: 47.5 }, { reps: 11, weight: 47.5 }, { reps: 10, weight: 50 }] },
            { name: 'Rosca Direta com Barra', sets: [{ reps: 10, weight: 32 }, { reps: 9, weight: 32 }, { reps: 8, weight: 32 }] },
            { name: 'Rosca Alternada com Halteres', sets: [{ reps: 12, weight: 14 }, { reps: 11, weight: 14 }, { reps: 10, weight: 16 }] },
            { name: 'Rosca Martelo', sets: [{ reps: 12, weight: 14 }, { reps: 11, weight: 14 }, { reps: 10, weight: 14 }] },
         ],
      },
      // Day 0: Legs (today - Sunday)
      {
         dayOffset: 0,
         plan: legsPlan,
         exercises: [
            { name: 'Agachamento Livre com Barra', sets: [{ reps: 8, weight: 85 }, { reps: 7, weight: 85 }, { reps: 6, weight: 87.5 }, { reps: 6, weight: 87.5 }] },
            { name: 'Leg Press 45°', sets: [{ reps: 12, weight: 200 }, { reps: 11, weight: 200 }, { reps: 10, weight: 200 }, { reps: 10, weight: 210 }] },
            { name: 'Afundo com Halteres', sets: [{ reps: 12, weight: 18 }, { reps: 10, weight: 18 }, { reps: 10, weight: 18 }] },
            { name: 'Cadeira Extensora', sets: [{ reps: 15, weight: 42.5 }, { reps: 13, weight: 42.5 }, { reps: 12, weight: 45 }] },
            { name: 'Mesa Flexora', sets: [{ reps: 12, weight: 37.5 }, { reps: 11, weight: 37.5 }, { reps: 10, weight: 40 }] },
            { name: 'Stiff com Barra', sets: [{ reps: 12, weight: 55 }, { reps: 10, weight: 55 }, { reps: 10, weight: 55 }] },
            { name: 'Panturrilha no Leg Press', sets: [{ reps: 20, weight: 130 }, { reps: 18, weight: 130 }, { reps: 16, weight: 140 }, { reps: 15, weight: 140 }] },
         ],
      },
   ];

   for (const day of workoutDays) {
      const date = new Date(today);
      date.setDate(today.getDate() + day.dayOffset);
      const startTime = new Date(date);
      startTime.setHours(7, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(8, 15, 0, 0);

      const log = await prisma.workoutLog.create({
         data: {
            userId: user.id,
            workoutPlanId: day.plan.id,
            date,
            startTime,
            endTime,
            isComplete: true,
            exercises: {
               create: day.exercises.map((ex, order) => ({
                  exerciseId: getEx(ex.name).id,
                  order,
                  sets: {
                     create: ex.sets.map((s, i) => ({
                        setNumber: i + 1,
                        reps: s.reps,
                        weight: s.weight,
                     })),
                  },
               })),
            },
         },
      });
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      console.log(`✅ Workout log: ${dayName} ${date.toISOString().split('T')[0]} - ${day.plan.name.split(' - ')[0]} (${log.id.substring(0, 8)})`);
   }

   // 5. Body weight records for the last 7 days (slight upward trend for bulk)
   const weights = [76.2, 76.0, 76.5, 76.3, 76.8, 76.6, 77.0];
   for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(7, 30, 0, 0);

      await prisma.bodyWeight.create({
         data: {
            userId: user.id,
            weight: weights[6 - i],
            date,
         },
      });
   }
   console.log(`✅ Body weight: 7 records (${weights[0]}kg → ${weights[6]}kg)`);

   // 6. Personal records for key exercises
   const prs = [
      { name: 'Supino Reto com Barra', weight: 75, reps: 7 },
      { name: 'Agachamento Livre com Barra', weight: 87.5, reps: 6 },
      { name: 'Remada Curvada com Barra', weight: 67.5, reps: 8 },
      { name: 'Leg Press 45°', weight: 210, reps: 10 },
      { name: 'Desenvolvimento com Halteres', weight: 24, reps: 8 },
      { name: 'Rosca Direta com Barra', weight: 32, reps: 10 },
   ];

   for (const pr of prs) {
      await prisma.personalRecord.upsert({
         where: {
            userId_exerciseId: {
               userId: user.id,
               exerciseId: getEx(pr.name).id,
            },
         },
         update: { weight: pr.weight, reps: pr.reps },
         create: {
            userId: user.id,
            exerciseId: getEx(pr.name).id,
            weight: pr.weight,
            reps: pr.reps,
            date: today,
         },
      });
   }
   console.log(`✅ Personal records: ${prs.length} PRs`);

   console.log('\n🎉 Test data seeded successfully!');
}

main()
   .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
   })
   .finally(() => prisma.$disconnect());
