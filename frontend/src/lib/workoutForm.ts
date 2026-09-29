export function parseOptionalNonNegativeNumber(value: string): number | null {
   const normalized = value.trim().replace(',', '.');
   if (!normalized) return null;

   const parsed = Number(normalized);
   return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function clampInteger(
   value: string,
   { min, max, fallback }: { min: number; max: number; fallback: number },
): number {
   const parsed = Number(value);
   if (!value.trim() || !Number.isFinite(parsed)) return fallback;
   return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export function formatNumberInput(value: number): string {
   return Number.isFinite(value) ? String(value) : '';
}

export function formatKilograms(value: number): string {
   return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
}

export function formatRestDuration(value: string | number): string | null {
   if (typeof value === 'string' && !value.trim()) return null;
   const seconds = typeof value === 'number'
      ? value
      : Number(value);

   if (!Number.isInteger(seconds) || seconds < 0) return null;
   if (seconds < 60) return `${seconds} s`;

   const minutes = Math.floor(seconds / 60);
   const remainder = seconds % 60;
   return remainder > 0 ? `${minutes} min ${remainder} s` : `${minutes} min`;
}
