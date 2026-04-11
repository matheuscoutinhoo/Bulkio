import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { registerSchema, type RegisterForm } from '@/lib/schemas';

export default function RegisterPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((s) => s.setAuth);
   const [error, setError] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
      resolver: zodResolver(registerSchema),
   });

   const onSubmit = async (data: RegisterForm) => {
      try {
         setError('');
         const response = await authApi.register({
            username: data.username,
            email: data.email,
            password: data.password,
         });
         const { user, accessToken } = response.data.data;
         setAuth(user, accessToken);
         navigate('/dashboard');
      } catch (err: any) {
         setError(err.response?.data?.message || 'Erro ao criar conta');
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center px-4">
         <Card className="w-full max-w-md animate-fade-in-up">
            <CardHeader className="text-center">
               <div className="flex justify-center mb-4">
                  <Dumbbell className="h-12 w-12 icon-gradient" />
               </div>
               <CardTitle className="text-2xl">Criar Conta</CardTitle>
               <CardDescription>Comece a gerenciar seus treinos</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
               <CardContent className="space-y-5">
                  {error && (
                     <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md animate-fade-in-down">
                        {error}
                     </div>
                  )}
                  <div className="space-y-3">
                     <Label htmlFor="username">Nome de usuário</Label>
                     <Input id="username" {...register('username')} />
                     {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
                  </div>
                  <div className="space-y-3">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" {...register('email')} />
                     {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-3">
                     <Label htmlFor="password">Senha</Label>
                     <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} className="pr-10" {...register('password')} />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                           tabIndex={-1}
                        >
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                     </div>
                     {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-3">
                     <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                     <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="pr-10" {...register('confirmPassword')} />
                        <button
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                           tabIndex={-1}
                        >
                           {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                     </div>
                     {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
                  </div>
               </CardContent>
               <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Criando...' : 'Criar Conta'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                     Já tem conta?{' '}
                     <Link to="/login" className="text-gradient hover:underline">
                        Entrar
                     </Link>
                  </p>
               </CardFooter>
            </form>
         </Card>
      </div>
   );
}
