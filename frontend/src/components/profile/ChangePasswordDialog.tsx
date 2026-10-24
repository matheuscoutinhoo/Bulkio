import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/lib/api';

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
   const navigate = useNavigate();
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmation, setConfirmation] = useState('');
   const [showPasswords, setShowPasswords] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (saving) return;
      if (newPassword.length < 8) { setError('Use pelo menos 8 caracteres na nova senha.'); return; }
      if (new TextEncoder().encode(newPassword).length > 72) { setError('A nova senha é muito longa.'); return; }
      if (newPassword !== confirmation) { setError('A confirmação não corresponde à nova senha.'); return; }
      if (newPassword === currentPassword) { setError('Escolha uma senha diferente da atual.'); return; }
      setSaving(true);
      setError('');
      try {
         await authApi.changePassword({ currentPassword, newPassword });
         useAuthStore.getState().logout();
         toast.success('Senha alterada', 'Entre novamente com sua nova senha.');
         navigate('/login', { replace: true });
      } catch (err) {
         setError(getApiErrorMessage(err, 'Não foi possível alterar a senha. Tente novamente.'));
         setSaving(false);
      }
   };

   return (
      <Dialog open onClose={saving ? () => {} : onClose} dismissible={!saving}>
         <DialogHeader>
            <span className="brand-mark mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-primary"><LockKeyhole className="h-6 w-6" /></span>
            <DialogTitle>Alterar senha</DialogTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">Confirme sua senha atual. Após a alteração, entre novamente para continuar.</p>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={saving} className="min-w-0 space-y-4">
               <div className="form-field">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input id="current-password" type={showPasswords ? 'text' : 'password'} autoComplete="current-password" maxLength={128} required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
               </div>
               <div className="form-field">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input id="new-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} required value={newPassword} onChange={event => setNewPassword(event.target.value)} aria-describedby="password-hint" />
                  <p id="password-hint" className="text-xs text-muted-foreground">Use pelo menos 8 caracteres e uma senha exclusiva para sua conta.</p>
               </div>
               <div className="form-field">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input id="confirm-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} required value={confirmation} onChange={event => setConfirmation(event.target.value)} />
               </div>
               <Button type="button" variant="ghost" className="px-0" aria-pressed={showPasswords} onClick={() => setShowPasswords(value => !value)}>
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
               </Button>
            </fieldset>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
               <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancelar</Button>
               <Button type="submit" disabled={saving}>{saving ? 'Alterando…' : 'Alterar senha'}</Button>
            </div>
         </form>
      </Dialog>
   );
}
