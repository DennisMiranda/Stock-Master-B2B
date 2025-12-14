import { z } from 'zod';

// Schema para Registro de Usuario
export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['client', 'admin', 'almacenero']).optional().default('client'),
    ruc: z.string().min(11, 'RUC debe tener 11 dígitos').optional(),
    companyName: z.string().min(2, 'Razón Social requerida').optional(),
    contactName: z.string().min(2, 'Nombre de contacto requerido').optional()
});

// Schema para Login (si fuera manejado por backend, aunque se usa Client SDK normalmente)
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
