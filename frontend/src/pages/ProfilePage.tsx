import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, Calendar, Pencil, Trash2, LogOut, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const goalLabels: Record<string, string> = {
   BULK: 'Ganho de Massa',
   CUT: 'Perda de Gordura',
   MAINTAIN: 'Manutenção',
};

export default function ProfilePage() {
   const navigate = useNavigate();
   const { user, setUser, logout } = useAuthStore();
   const [loading, setLoading] = useState(true);
   const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

   // Username editing
   const [editingUsername, setEditingUsername] = useState(false);
   const [newUsername, setNewUsername] = useState('');
   const [usernameError, setUsernameError] = useState('');
   const [savingUsername, setSavingUsername] = useState(false);

   // Delete account
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState('');
   const [deleting, setDeleting] = useState(false);

   useEffect(() => {
      authApi.getProfile()
         .then((res) => {
            setProfile(res.data.data);
         })
         .catch(console.error)
         .finally(() => setLoading(false));
   }, []);

   const handleStartEditing = () => {
      setNewUsername(user?.username || '');
      setUsernameError('');
      setEditingUsername(true);
   };

   const handleCancelEditing = () => {
      setEditingUsername(false);
      setUsernameError('');
   };

   const handleSaveUsername = async () => {
      const trimmed = newUsername.trim();

      if (!trimmed || trimmed.length < 3) {
         setUsernameError('Mínimo de 3 caracteres');
         return;
      }
      if (trimmed.length > 30) {
         setUsernameError('Máximo de 30 caracteres');
         return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
         setUsernameError('Apenas letras, números e underscores');
         return;
      }
      if (trimmed === user?.username) {
         setEditingUsername(false);
         return;
      }

      setSavingUsername(true);
      setUsernameError('');

      try {
         const res = await authApi.updateProfile({ username: trimmed });
         setUser(res.data.data);
         setProfile(res.data.data);
         setEditingUsername(false);
      } catch (err: unknown) {
         const error = err as { response?: { data?: { message?: string } } };
         const message = error.response?.data?.message || 'Erro ao atualizar';
         if (message.toLowerCase().includes('username already taken')) {
            setUsernameError('Nome de usuário já está em uso');
         } else {
            setUsernameError(message);
         }
      } finally {
         setSavingUsername(false);
      }
   };

   const handleLogout = async () => {
      try {
         await authApi.logout();
      } finally {
         logout();
         navigate('/login');
      }
   };

   const handleDeleteAccount = async () => {
      if (deleteConfirmation !== 'APAGAR') return;
      setDeleting(true);
      try {
         await authApi.deleteAccount();
         logout();
         navigate('/login');
      } catch (err) {
         console.error(err);
         setDeleting(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
         </div>
      );
   }

   const createdAt = profile?.createdAt
      ? format(new Date(profile.createdAt as string), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : '-';

   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Perfil</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie suas informações</p>
         </div>

         {/* User info card */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações da Conta
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
               {/* Username */}
               <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                     <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nome de Usuário</Label>
                     {editingUsername ? (
                        <div className="flex items-center gap-2">
                           <Input
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="max-w-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') handleSaveUsername();
                                 if (e.key === 'Escape') handleCancelEditing();
                              }}
                           />
                           <button
                              onClick={handleSaveUsername}
                              disabled={savingUsername}
                              className="p-2 rounded-md hover:bg-accent transition-colors text-success"
                              title="Salvar"
                           >
                              <Check className="h-4 w-4" />
                           </button>
                           <button
                              onClick={handleCancelEditing}
                              className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                              title="Cancelar"
                           >
                              <X className="h-4 w-4" />
                           </button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <p className="text-base font-medium">{user?.username}</p>
                           <button
                              onClick={handleStartEditing}
                              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                              title="Editar nome de usuário"
                           >
                              <Pencil className="h-3.5 w-3.5" />
                           </button>
                        </div>
                     )}
                     {usernameError && (
                        <p className="text-destructive text-sm">{usernameError}</p>
                     )}
                  </div>
               </div>

               {/* Email */}
               <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                  <div className="flex items-center gap-2 min-w-0">
                     <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                     <p className="text-sm sm:text-base truncate">{user?.email}</p>
                  </div>
               </div>

               {/* Goal */}
               <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Objetivo</Label>
                  <div>
                     {user?.goal ? (
                        <Badge variant="secondary">{goalLabels[user.goal] || user.goal}</Badge>
                     ) : (
                        <p className="text-sm text-muted-foreground">Nenhum objetivo definido</p>
                     )}
                  </div>
               </div>

               {/* Created at */}
               <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Membro desde</Label>
                  <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-purple-500" />
                     <p className="text-base">{createdAt}</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Actions card */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2 text-orange-500" />
                  Sair da conta
               </Button>
               <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => setShowDeleteDialog(true)}
               >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Apagar conta
               </Button>
            </CardContent>
         </Card>

         {/* Delete account confirmation dialog */}
         <Dialog open={showDeleteDialog} onClose={() => { setShowDeleteDialog(false); setDeleteConfirmation(''); }}>
            <DialogHeader>
               <DialogTitle className="text-destructive">Apagar conta permanentemente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">
                  Esta ação é <span className="font-semibold text-foreground">irreversível</span>. Todos os seus dados serão apagados permanentemente, incluindo fichas de treino, histórico, registros de peso e recordes pessoais.
               </p>
               <div className="space-y-2">
                  <Label>
                     Digite <span className="font-mono font-bold text-destructive">APAGAR</span> para confirmar
                  </Label>
                  <Input
                     value={deleteConfirmation}
                     onChange={(e) => setDeleteConfirmation(e.target.value)}
                     placeholder="APAGAR"
                     autoComplete="off"
                  />
               </div>
               <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmation(''); }}>
                     Cancelar
                  </Button>
                  <Button
                     variant="destructive"
                     disabled={deleteConfirmation !== 'APAGAR' || deleting}
                     onClick={handleDeleteAccount}
                  >
                     {deleting ? 'Apagando...' : 'Apagar conta'}
                  </Button>
               </div>
            </div>
         </Dialog>
      </div>
   );
}
