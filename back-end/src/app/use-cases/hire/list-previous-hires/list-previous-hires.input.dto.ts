import z from 'zod';

export const ListPreviousHiresInputDto = z.object({
    userId: z.uuid('ID de usuário inválido'),
    role: z.enum(['client', 'worker']),
});

export type ListPreviousHiresInputDto = z.infer<typeof ListPreviousHiresInputDto>;
