import z from "zod";

export const CreateWorkerInputDto = z.object({
    userId: z.uuid("Usuário inválido"), 
    description: z.string().min(10, "Descrição muito curta"),
    workingSince: z.coerce.date()
});

export type CreateWorkerInputDto = z.infer<typeof CreateWorkerInputDto>