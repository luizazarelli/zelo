import { AcceptProposalInputDto } from '@application/use-cases/proposal/accept-proposal/accept-proposal.input.dto'
import { AcceptProposalUsecase } from '@application/use-cases/proposal/accept-proposal/accept-proposal.usecase'
import { authMiddleware } from '@presentation/http/middleware/auth.middleware'
import { ResponseProvider } from '@presentation/provider/response.provider'
import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import BaseController from '../base.controller'

export default class AcceptProposalController extends BaseController {
    register(http: FastifyInstance): void {
        http.patch('/api/v1/hire/:hireId/proposal/accept', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { hireId } = request.params as { hireId: string }
            const payload = AcceptProposalInputDto.parse({ hireId, ...(request.body as object) })
            const usecase = container.resolve(AcceptProposalUsecase)
            const result = await usecase.execute(payload)

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Proposta aceita com sucesso',
                data: result,
            })
        })
    }
}
