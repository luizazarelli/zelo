import z from 'zod';

export const SendMessageInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    senderId: z.uuid('ID do remetente inválido'),
    content: z.string().min(1, 'A mensagem não pode estar vazia'),
});

export type SendMessageInputDto = z.infer<typeof SendMessageInputDto>;
