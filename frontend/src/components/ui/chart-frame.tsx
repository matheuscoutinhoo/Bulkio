import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function ChartFrame({ label, children, height, className }: { label: string; children: ReactElement; height?: number; className?: string }) {
   return (
      <div role="group" aria-label={label} className={cn('chart-frame h-64 min-w-0 w-full max-w-full sm:h-80', className)} style={height ? { height } : undefined} onDragStart={event => event.preventDefault()}>
         <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {children}
         </ResponsiveContainer>
      </div>
   );
}
