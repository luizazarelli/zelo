import z from 'zod';

export const SignUpInputDTO = z.object({
    name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
    email: z.email('O e-mail é obrigatório'),
    password: z
        .string()
        .min(8)
        .max(32)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            {
                error: 'A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número, 1 caractere especial (@, $, !, %, *, ?, &) e ter no mínimo 8 caracteres.',
            }
        ),
    phone: z.string().min(10, "O número de telefone deve ser válido")
});

export type SignUpInputDTO = z.infer<typeof SignUpInputDTO>;
