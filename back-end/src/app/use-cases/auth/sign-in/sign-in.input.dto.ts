import z from 'zod';

export const SignInInputDTO = z.object({
    email: z.email(),
    password: z.string(),
});

export type SignInInputDTO = z.infer<typeof SignInInputDTO>;
