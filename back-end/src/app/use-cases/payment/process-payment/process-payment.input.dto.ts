import z from 'zod';

export const ProcessPaymentInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    amount: z.number().positive('O valor deve ser positivo'),
});

export type ProcessPaymentInputDto = z.infer<typeof ProcessPaymentInputDto>;
