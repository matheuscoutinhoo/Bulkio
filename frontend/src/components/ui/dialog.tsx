import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
   open: boolean;
   onClose: () => void;
   children: React.ReactNode;
   className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
   React.useEffect(() => {
      if (open) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = '';
      }
      return () => {
         document.body.style.overflow = '';
      };
   }, [open]);

   if (!open) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="fixed inset-0 bg-black/80" onClick={onClose} />
         <div
            className={cn(
               'relative z-50 max-h-[85vh] sm:max-h-[90vh] w-[calc(100%-2rem)] sm:w-full max-w-lg rounded-lg border bg-background p-4 sm:p-6 shadow-lg flex flex-col mx-auto',
               className,
            )}
         >
            <button
               onClick={onClose}
               className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
               <X className="h-4 w-4" />
            </button>
            {children}
         </div>
      </div>
   );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
   return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
   return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
