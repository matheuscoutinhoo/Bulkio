import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function SectionOverview({ icon: Icon, eyebrow, title, description, children }: { icon: LucideIcon; eyebrow: string; title: string; description: string; children?: ReactNode }) {
   return (
      <section className="relative isolate overflow-hidden rounded-3xl border border-primary/15 bg-card p-5 sm:p-7">
         <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
         <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
               <span className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary sm:h-14 sm:w-14"><Icon className="h-6 w-6" aria-hidden="true" /></span>
               <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-2xl">{title}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
               </div>
            </div>
            {children && <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-56">{children}</div>}
         </div>
      </section>
   );
}

export function OverviewMetric({ value, label }: { value: ReactNode; label: string }) {
   return <div className="min-w-0 rounded-2xl border border-border/50 bg-background/65 p-3.5"><p className="break-words text-xl font-bold tabular-nums sm:text-2xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
