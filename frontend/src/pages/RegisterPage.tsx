import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldMessage } from '@/components/ui/feedback';
import { AuthShell } from '@/components/auth/AuthShell';
import { registerSchema, type RegisterForm } from '@/lib/schemas';
import { getApiErrorMessage } from '@/lib/api';

export default function RegisterPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((state) => state.setAuth);
   const [error, setError] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

   const onSubmit = async (data: RegisterForm) => {
      try {
         setError('');
         const response = await authApi.register({ username: data.username, email: data.email, password: data.password });
         const { user, accessToken } = response.data.data;
         setAuth(user, accessToken);
         navigate('/dashboard');
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível criar a conta. Tente novamente.'));
      }
   };

   const passwordToggle = (shown: boolean, toggle: () => void, label: string) => (
      <button type="button" onClick={toggle} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground" aria-label={`${shown ? 'Ocultar' : 'Mostrar'} ${label}`}>
         {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
   );

   return (
      <AuthShell>
         <Card className="border-border/70 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-5 text-center sm:text-left">
               <CardTitle className="text-2xl sm:text-3xl">Crie sua conta</CardTitle>
               <CardDescription className="text-sm leading-relaxed">Comece a organizar seus treinos e acompanhar sua evolução.</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {error && <div role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
                  <div className="space-y-2">
                     <Label htmlFor="username">Nome de usuário</Label>
                     <Input id="username" autoComplete="username" placeholder="Como quer ser chamado" aria-invalid={!!errors.username} aria-describedby={errors.username ? 'username-error' : undefined} {...register('username')} />
                     {errors.username?.message && <FieldMessage id="username-error">{errors.username.message}</FieldMessage>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'register-email-error' : undefined} {...register('email')} />
                     {errors.email?.message && <FieldMessage id="register-email-error">{errors.email.message}</FieldMessage>}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                     <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                           <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-12" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'register-password-error' : undefined} {...register('password')} />
                           {passwordToggle(showPassword, () => setShowPassword((value) => !value), 'senha')}
                        </div>
                        {errors.password?.message && <FieldMessage id="register-password-error">{errors.password.message}</FieldMessage>}
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <div className="relative">
                           <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-12" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />
                           {passwordToggle(showConfirmPassword, () => setShowConfirmPassword((value) => !value), 'confirmação de senha')}
                        </div>
                        {errors.confirmPassword?.message && <FieldMessage id="confirm-password-error">{errors.confirmPassword.message}</FieldMessage>}
                     </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">Use pelo menos 8 caracteres, combinando letras e números.</p>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                     {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                     {isSubmitting ? 'Criando conta…' : 'Criar conta'}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">Já tem uma conta? <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Entrar</Link></p>
               </form>
            </CardContent>
         </Card>
      </AuthShell>
   );
}
