import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
   email: z.string().email('Email inválido'),
   password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((s) => s.setAuth);
   const [error, setError] = useState('');
   const [showPassword, setShowPassword] = useState(false);

   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
      resolver: zodResolver(loginSchema),
   });

   const onSubmit = async (data: LoginForm) => {
      try {
         setError('');
         const response = await authApi.login(data);
         const { user, accessToken } = response.data.data;
         setAuth(user, accessToken);
         navigate('/dashboard');
      } catch (err: any) {
         setError(err.response?.data?.message || 'Erro ao fazer login');
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center px-4">
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
               <div className="flex justify-center mb-4">
                  <Dumbbell className="h-12 w-12 text-primary" />
               </div>
               <CardTitle className="text-2xl">Bem-vindo ao Bulkio</CardTitle>
               <CardDescription>Entre na sua conta para continuar</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
               <CardContent className="space-y-5">
                  {error && (
                     <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                     </div>
                  )}
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
               </CardContent>
               <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                     Não tem conta?{' '}
                     <Link to="/register" className="text-primary hover:underline">
                        Criar conta
                     </Link>
                  </p>
               </CardFooter>
            </form>
         </Card>
      </div>
   );
}
