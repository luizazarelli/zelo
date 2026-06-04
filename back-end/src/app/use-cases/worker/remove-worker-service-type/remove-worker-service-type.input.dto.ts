import z from "zod";

export const removeWorkerServiceTypeInputDto = z.object({
    workerId: z.uuid("O usuário informado não é válido"),
    serviceTypeId: z.uuid("O tipo de serviço informado não é válido")
});

export type RemoveWorkerServiceTypeInputDto = z.infer<typeof removeWorkerServiceTypeInputDto>;