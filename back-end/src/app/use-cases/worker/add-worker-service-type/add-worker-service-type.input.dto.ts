import z from "zod";

export const addWorkerServiceTypeInputDto = z.object({
	userId: z.uuid("Usuário inválido"),
	serviceTypeId: z.uuid("Tipo de serviço inválido"),
});

export type AddWorkerServiceTypeInputDto = z.infer<
	typeof addWorkerServiceTypeInputDto
>;
