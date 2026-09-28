import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
   open: boolean;
   onClose: () => void;
   children: React.ReactNode;
   className?: string;
}

const DialogContext = React.createContext<{ titleId: string } | null>(null);

export function Dialog({ open, onClose, children, className }: DialogProps) {
   const titleId = React.useId();
   const dialogRef = React.useRef<HTMLDivElement>(null);
   const onCloseRef = React.useRef(onClose);
   React.useEffect(() => {
      onCloseRef.current = onClose;
   }, [onClose]);

   React.useEffect(() => {
      if (!open) return;

      const previousFocus = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
            event.preventDefault();
            onCloseRef.current();
            return;
         }

         if (event.key !== 'Tab' || !dialogRef.current) return;
         const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
         ));
         if (focusable.length === 0) {
            event.preventDefault();
            dialogRef.current.focus();
            return;
         }
         const first = focusable[0];
         const last = focusable[focusable.length - 1];
         if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
         } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
         }
      };

      document.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => dialogRef.current?.focus());

      return () => {
         document.body.style.overflow = '';
         document.removeEventListener('keydown', handleKeyDown);
         previousFocus?.focus();
      };
   }, [open]);

   if (!open) return null;

   return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden="true" />
         <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
               'relative z-50 max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] w-[calc(100%-1.5rem)] sm:w-full max-w-lg rounded-2xl border border-border/60 bg-background p-5 sm:p-7 shadow-2xl shadow-black/15 flex flex-col mx-auto animate-scale-in overflow-hidden focus:outline-none',
               className,
            )}
         >
            <button
               type="button"
               onClick={onClose}
               aria-label="Fechar diálogo"
               className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60"
            >
               <X className="h-5 w-5" />
            </button>
            <DialogContext.Provider value={{ titleId }}>{children}</DialogContext.Provider>
         </div>
      </div>,
      document.body,
   );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
   return <div className={cn('mb-6 flex flex-col space-y-2 pr-10', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
   const context = React.useContext(DialogContext);
   return <h2 id={context?.titleId} className={cn('text-xl font-semibold leading-tight tracking-[-0.015em]', className)} {...props} />;
}
