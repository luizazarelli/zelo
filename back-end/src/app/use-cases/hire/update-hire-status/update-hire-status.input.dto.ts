import z from 'zod'

export const UpdateHireStatusInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    status: z.enum(['completed', 'cancelled']),
})

export type UpdateHireStatusInputDto = z.infer<typeof UpdateHireStatusInputDto>
