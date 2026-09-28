import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const styles: Record<ToastVariant, string> = {
   success: 'border-success/25 bg-card text-success',
   error: 'border-destructive/25 bg-card text-destructive',
   info: 'border-primary/25 bg-card text-primary',
};

export function Toaster() {
   const items = useToastStore((state) => state.items);
   const remove = useToastStore((state) => state.remove);

   return (
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-96" aria-live="polite" aria-atomic="false">
         {items.map((item) => {
            const Icon = icons[item.variant];
            return (
               <div
                  key={item.id}
                  role={item.variant === 'error' ? 'alert' : 'status'}
                  className={cn('pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-3.5 shadow-xl shadow-black/10 animate-fade-in-up', styles[item.variant])}
               >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-foreground">
                     <p className="text-sm font-semibold">{item.title}</p>
                     {item.description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
                  </div>
                  <button type="button" onClick={() => remove(item.id)} aria-label="Dispensar mensagem" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                     <X className="h-4 w-4" />
                  </button>
               </div>
            );
         })}
      </div>
   );
}
