import z from 'zod';

export const UpdateUserInputDto = z.object({
    userId: z.uuid('ID de usuário inválido'),
    name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres').optional(),
    phone: z.string().min(10, 'Número de telefone inválido').optional(),
}).refine((data) => data.name || data.phone, {
    message: 'Informe pelo menos um campo para atualizar',
});

export type UpdateUserInputDto = z.infer<typeof UpdateUserInputDto>;
