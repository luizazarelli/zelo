import { GetHireProposalsInputDto } from '@application/use-cases/proposal/get-hire-proposals/get-hire-proposals.input.dto'
import { GetHireProposalsUsecase } from '@application/use-cases/proposal/get-hire-proposals/get-hire-proposals.usecase'
import { authMiddleware } from '@presentation/http/middleware/auth.middleware'
import { ResponseProvider } from '@presentation/provider/response.provider'
import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import BaseController from '../base.controller'

export default class GetHireProposalsController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/hire/:hireId/proposal', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { hireId } = request.params as { hireId: string }
            const payload = GetHireProposalsInputDto.parse({ hireId })
            const usecase = container.resolve(GetHireProposalsUsecase)
            const result = await usecase.execute(payload)

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Propostas listadas com sucesso',
                data: result,
            })
        })
    }
}
