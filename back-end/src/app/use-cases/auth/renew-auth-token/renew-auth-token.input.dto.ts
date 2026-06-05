import z from "zod";

export const renewAuthTokenInputDto = z.object({
	refreshToken: z.uuid(),
});

export type RenewAuthTokenInputDto = z.infer<typeof renewAuthTokenInputDto>;
