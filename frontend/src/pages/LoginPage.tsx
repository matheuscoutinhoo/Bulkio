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
import { loginSchema, type LoginForm } from '@/lib/schemas';
import { getApiErrorMessage } from '@/lib/api';

export default function LoginPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((state) => state.setAuth);
   const [error, setError] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

   const onSubmit = async (data: LoginForm) => {
      try {
         setError('');
         const response = await authApi.login(data);
         const { user, accessToken } = response.data.data;
         setAuth(user, accessToken);
         navigate('/dashboard');
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível entrar. Verifique seus dados e tente novamente.'));
      }
   };

   return (
      <AuthShell>
         <Card className="border-border/70 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-5 text-center sm:text-left">
               <CardTitle className="text-2xl sm:text-3xl">Bem-vindo de volta</CardTitle>
               <CardDescription className="text-sm leading-relaxed">Entre para continuar acompanhando seus treinos.</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {error && <div role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
                     {errors.email?.message && <FieldMessage id="email-error">{errors.email.message}</FieldMessage>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="password">Senha</Label>
                     <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-12" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                     </div>
                     {errors.password?.message && <FieldMessage id="password-error">{errors.password.message}</FieldMessage>}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                     {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                     {isSubmitting ? 'Entrando…' : 'Entrar'}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">Ainda não tem conta? <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Criar conta</Link></p>
               </form>
            </CardContent>
         </Card>
      </AuthShell>
   );
}
