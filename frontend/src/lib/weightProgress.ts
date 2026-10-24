export function getWeightProgress(
   history: { weight: number; date: string; createdAt?: string }[],
   initial: number | null | undefined,
   target: number | null | undefined,
) {
   const sorted = [...history].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)
      || Date.parse(a.createdAt ?? a.date) - Date.parse(b.createdAt ?? b.date));
   const first = sorted[0];
   const latest = sorted.at(-1);
   const baseline = first?.weight ?? initial;
   const progress = latest && baseline != null && target != null
      ? target === baseline ? (latest.weight === target ? 100 : 0)
         : Math.max(0, Math.min(100, (latest.weight - baseline) / (target - baseline) * 100))
      : null;
   return { baseline, baselineDate: first?.date, progress };
}
