import z from "zod";

export const addWorkerServiceTypeDto = z.object({
    userId: z.uuid("Usuário inválido"),
    serviceTypeId: z.uuid("Tipo de serviço inválido")
});

export type AddWorkerServiceTypeDto = z.infer<typeof addWorkerServiceTypeDto>;