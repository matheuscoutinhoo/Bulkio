import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, mobileLayout = 'rows', ...props }: ComponentProps<'table'> & { mobileLayout?: 'rows' | 'cards' }) {
   return <div className={cn('data-table w-full min-w-0 overflow-x-auto rounded-2xl border border-border/60 bg-card', mobileLayout === 'cards' && 'data-table--cards')}><table role="table" className={cn('w-full border-collapse text-left text-sm', className)} {...props} /></div>;
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
   return <thead role="rowgroup" className={cn('border-b border-border/60 bg-linear-to-r from-primary/7 to-secondary/50', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
   return <tbody role="rowgroup" className={cn('divide-y divide-border/50', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
   return <tr role="row" className={cn('transition-colors hover:bg-primary/4', className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
   return <th role="columnheader" scope="col" className={cn('px-3 py-3 text-xs font-semibold text-muted-foreground sm:px-4', className)} {...props} />;
}

export function TableCell({ className, mobileLabel, children, ...props }: ComponentProps<'td'> & { mobileLabel?: string }) {
   return <td role="cell" className={cn('px-3 py-3 align-middle sm:px-4', className)} {...props}>{mobileLabel && <span aria-hidden="true" className="table-mobile-label">{mobileLabel}</span>}{children}</td>;
}
