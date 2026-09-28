import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
   open: boolean;
   onClose: () => void;
   onConfirm: () => void | Promise<void>;
   title: string;
   description: string;
   confirmLabel?: string;
   loading?: boolean;
   icon?: LucideIcon;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Excluir', loading, icon: Icon = AlertTriangle }: ConfirmDialogProps) {
   return (
      <Dialog open={open} onClose={onClose} className="sm:max-w-md">
         <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
               <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle>{title}</DialogTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
         </DialogHeader>
         <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
               {loading ? 'Aguarde…' : confirmLabel}
            </Button>
         </div>
      </Dialog>
   );
}
