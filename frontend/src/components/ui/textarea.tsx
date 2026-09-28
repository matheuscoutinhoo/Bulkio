import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
   ({ className, ...props }, ref) => {
      return (
         <textarea
            className={cn(
               'flex min-h-24 w-full resize-y rounded-lg border border-border/70 bg-card/70 px-4 py-3 text-sm transition-[border-color,background-color]',
               'placeholder:text-muted-foreground',
               'hover:border-primary/35 focus-visible:border-primary/75 focus-visible:outline-none',
               'aria-invalid:border-destructive disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60',
               className,
            )}
            ref={ref}
            {...props}
         />
      );
   },
);
Textarea.displayName = 'Textarea';

export { Textarea };
