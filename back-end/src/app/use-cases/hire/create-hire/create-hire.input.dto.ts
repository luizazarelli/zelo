import z from 'zod';

export const CreateHireInputDto = z.object({
    clientId: z.uuid('ID do cliente inválido'),
    workerId: z.uuid('ID do profissional inválido'),
    serviceTypeId: z.uuid('ID do tipo de serviço inválido'),
    description: z.string().min(10, 'Descrição muito curta'),
});

export type CreateHireInputDto = z.infer<typeof CreateHireInputDto>;
