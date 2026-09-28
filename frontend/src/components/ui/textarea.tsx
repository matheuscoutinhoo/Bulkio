import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
   ({ className, ...props }, ref) => {
      return (
         <textarea
            className={cn(
               'flex min-h-24 w-full resize-y rounded-lg border border-input bg-card/70 px-3.5 py-2.5 text-sm shadow-sm transition-[border-color,box-shadow,background-color]',
               'ring-offset-background placeholder:text-muted-foreground',
               'hover:border-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
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
