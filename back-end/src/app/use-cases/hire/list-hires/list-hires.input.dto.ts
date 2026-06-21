import z from 'zod'

export const ListHiresInputDto = z.object({
    userId: z.uuid('ID de usuário inválido'),
    role: z.enum(['client', 'worker']),
    status: z.enum(['negotiating', 'accepted', 'completed', 'cancelled']).optional(),
})

export type ListHiresInputDto = z.infer<typeof ListHiresInputDto>
