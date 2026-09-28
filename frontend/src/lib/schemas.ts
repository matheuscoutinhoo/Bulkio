import { z } from 'zod';

export const loginSchema = z.object({
   email: z.string().email('Email inválido'),
   password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
   username: z
      .string()
      .trim()
      .min(3, 'Mínimo 3 caracteres')
      .max(30, 'Máximo 30 caracteres')
      .regex(/^[\p{L}\p{N}_ ]+$/u, 'Apenas letras, números, espaços e _'),
   email: z.string().email('Email inválido'),
   password: z.string().min(8, 'Mínimo 8 caracteres'),
   confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
   message: 'As senhas não conferem',
   path: ['confirmPassword'],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
