import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    ruc: z
        .string()
        .length(11, "El RUC debe tener 11 dígitos")
        .regex(/^\d+$/, "El RUC solo debe contener números"),
    companyName: z.string().min(3, "La razón social es obligatoria"),
    contactName: z.string().min(3, "El nombre de contacto es obligatorio"),
});

export const syncSchema = z.object({
    uid: z.string().min(1, "UID es requerido"),
    email: z.string().email("Email inválido"),
    displayName: z.string().optional(),
    photoURL: z.string().optional(),
});

// [NUEVO] Schemas para Gestión de Usuarios
export const createUserSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    displayName: z.string().min(3, "Nombre requerido"),
    role: z.enum(['admin', 'warehouse', 'driver', 'client'])
});

export const updateUserSchema = z.object({
    role: z.enum(['admin', 'warehouse', 'driver', 'client']).optional(),
    isActive: z.boolean().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SyncInput = z.infer<typeof syncSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
