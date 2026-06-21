import z from 'zod'

export const AcceptProposalInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    acceptorId: z.uuid('ID do aceitante inválido'),
})

export type AcceptProposalInputDto = z.infer<typeof AcceptProposalInputDto>
