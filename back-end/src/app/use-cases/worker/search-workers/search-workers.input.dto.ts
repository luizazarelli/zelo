import z from "zod";

export const searchWorkersInputDto = z.object({
	serviceTypes: z.array(z.uuid()).nullish(),
});

export type SearchWorkersInputDto = z.infer<typeof searchWorkersInputDto>;
