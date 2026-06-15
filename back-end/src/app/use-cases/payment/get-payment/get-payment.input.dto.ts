import z from 'zod';

export const GetPaymentInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
});

export type GetPaymentInputDto = z.infer<typeof GetPaymentInputDto>;
