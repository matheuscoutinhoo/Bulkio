import { z } from 'zod';

export const loginSchema = z.object({
   email: z.string().email('Email inválido'),
   password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
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

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
