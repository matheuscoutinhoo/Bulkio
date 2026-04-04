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
import { Dumbbell } from 'lucide-react';

const registerSchema = z.object({
   username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(30, 'Máximo 30 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
   email: z.string().email('Email inválido'),
   password: z.string().min(8, 'Mínimo 8 caracteres'),
   confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
   message: 'As senhas não conferem',
   path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((s) => s.setAuth);
   const [error, setError] = useState('');

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
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
               <div className="flex justify-center mb-4">
                  <Dumbbell className="h-12 w-12 text-primary" />
               </div>
               <CardTitle className="text-2xl">Criar Conta</CardTitle>
               <CardDescription>Comece a gerenciar seus treinos</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
               <CardContent className="space-y-4">
                  {error && (
                     <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                     </div>
                  )}
                  <div className="space-y-2">
                     <Label htmlFor="username">Nome de usuário</Label>
                     <Input id="username" placeholder="john_doe" {...register('username')} />
                     {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
                     {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="password">Senha</Label>
                     <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register('password')} />
                     {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                     <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                     {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
                  </div>
               </CardContent>
               <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Criando...' : 'Criar Conta'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                     Já tem conta?{' '}
                     <Link to="/login" className="text-primary hover:underline">
                        Entrar
                     </Link>
                  </p>
               </CardFooter>
            </form>
         </Card>
      </div>
   );
}
