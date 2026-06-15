import z from 'zod';

export const ListMessagesInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    requesterId: z.uuid('ID do solicitante inválido'),
});

export type ListMessagesInputDto = z.infer<typeof ListMessagesInputDto>;
