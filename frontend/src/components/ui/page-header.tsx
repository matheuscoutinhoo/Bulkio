import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
   title: string;
   description: string;
   actions?: ReactNode;
   className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
   return (
      <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
         <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
         </div>
         {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">{actions}</div>}
      </header>
   );
}
