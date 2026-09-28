import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
   ({ className, ...props }, ref) => {
      return (
         <textarea
            className={cn(
               'flex min-h-24 w-full resize-y rounded-xl border border-primary/60 bg-background/70 px-4 py-3 text-sm caret-primary transition-[border-color,background-color]',
               'placeholder:text-muted-foreground',
               'hover:border-primary/80 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none',
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
