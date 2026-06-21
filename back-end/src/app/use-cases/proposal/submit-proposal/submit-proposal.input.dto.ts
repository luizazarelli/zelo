import z from 'zod'

export const SubmitProposalInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    authorId: z.uuid('ID do autor inválido'),
    amount: z.number().positive('O valor deve ser positivo'),
})

export type SubmitProposalInputDto = z.infer<typeof SubmitProposalInputDto>
