import z from "zod";

export const createServiceTypeInputDto = z.object({
    name: z.string("O nome não é válido").min(5, "O tamanho do nome é inválido"),
    description: z.string().nullish()
});

export type CreateServiceTypeInputDto = z.infer<typeof createServiceTypeInputDto>;