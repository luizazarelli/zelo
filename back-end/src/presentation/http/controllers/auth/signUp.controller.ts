import { SignUpInputDTO } from '@application/use-cases/auth/sign-up/sign-up.input.dto';
import { SignUpUseCase } from '@application/use-cases/auth/sign-up/sign-up.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class SignUpController implements BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/auth/register', async (request, response) => {
            const payload = SignUpInputDTO.parse(request.body);
            const usecase = container.resolve(SignUpUseCase);
            const result = usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(response, {
                message: 'Cadastro realizado com sucesso',
                data: result,
            });
        });
    }
}
