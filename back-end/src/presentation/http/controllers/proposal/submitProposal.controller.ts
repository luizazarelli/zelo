import { SubmitProposalInputDto } from '@application/use-cases/proposal/submit-proposal/submit-proposal.input.dto'
import { SubmitProposalUsecase } from '@application/use-cases/proposal/submit-proposal/submit-proposal.usecase'
import { authMiddleware } from '@presentation/http/middleware/auth.middleware'
import { ResponseProvider } from '@presentation/provider/response.provider'
import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import BaseController from '../base.controller'

export default class SubmitProposalController extends BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/hire/:hireId/proposal', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { hireId } = request.params as { hireId: string }
            const payload = SubmitProposalInputDto.parse({ hireId, ...(request.body as object) })
            const usecase = container.resolve(SubmitProposalUsecase)
            const result = await usecase.execute(payload)

            ResponseProvider.sendSuccessResponse(reply, {
                code: 201,
                message: 'Contra-proposta enviada com sucesso',
                data: result,
            })
        })
    }
}
