import type { LucideIcon } from 'lucide-react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
   icon: LucideIcon;
   title: string;
   description: string;
   actionLabel?: string;
   onAction?: () => void;
   compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, compact }: EmptyStateProps) {
   return (
      <div className={cn('flex flex-col items-center justify-center px-5 text-center', compact ? 'py-8' : 'py-12 sm:py-16')}>
         <div className="brand-mark mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-primary">
            <Icon className="h-6 w-6" aria-hidden="true" />
         </div>
         <h2 className="text-base font-semibold">{title}</h2>
         <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
         {actionLabel && onAction && <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>}
      </div>
   );
}

export function LoadingState({ label = 'Carregando conteúdo' }: { label?: string }) {
   return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3" role="status" aria-live="polite">
         <LoaderCircle className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
         <span className="text-sm text-muted-foreground">{label}</span>
      </div>
   );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
   return (
      <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-center" role="alert">
         <AlertCircle className="mx-auto h-6 w-6 text-destructive" aria-hidden="true" />
         <p className="mt-2 text-sm font-medium">{message}</p>
         {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Tentar novamente</Button>}
      </div>
   );
}

export function FieldMessage({ children, id }: { children: string; id?: string }) {
   return <p id={id} className="text-sm text-destructive" role="alert">{children}</p>;
}
