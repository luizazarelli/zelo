import z from "zod";

export const searchWorkersInputDto = z.object({
	serviceTypes: z.preprocess(
		(val) => (val == null ? undefined : Array.isArray(val) ? val : [val]),
		z.array(z.string().uuid()).nullish(),
	),
});

export type SearchWorkersInputDto = z.infer<typeof searchWorkersInputDto>;
