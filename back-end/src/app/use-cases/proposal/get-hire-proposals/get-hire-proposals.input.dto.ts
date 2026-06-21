import z from 'zod'

export const GetHireProposalsInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
})

export type GetHireProposalsInputDto = z.infer<typeof GetHireProposalsInputDto>
