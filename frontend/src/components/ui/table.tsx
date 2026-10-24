import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: ComponentProps<'table'>) {
   return <div className="data-table w-full min-w-0 overflow-x-auto rounded-xl border border-border/60"><table className={cn('w-full border-collapse text-left text-sm', className)} {...props} /></div>;
}

export function TableHeader(props: ComponentProps<'thead'>) {
   return <thead className="border-b border-border/60 bg-secondary/60" {...props} />;
}

export function TableBody(props: ComponentProps<'tbody'>) {
   return <tbody className="divide-y divide-border/60" {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
   return <tr className={cn('transition-colors hover:bg-secondary/30', className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
   return <th scope="col" className={cn('px-2 py-3 text-xs font-semibold text-muted-foreground sm:px-4', className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
   return <td className={cn('px-2 py-2.5 align-middle sm:px-4', className)} {...props} />;
}
