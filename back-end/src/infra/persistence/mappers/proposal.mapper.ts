import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { proposal } from '../schema'

export class ProposalMapper {
    static toDomain(model: InferSelectModel<typeof proposal>): ProposalEntity {
        return ProposalEntity.restore({
            id: model.id,
            hireId: model.hireId,
            authorId: model.authorId,
            amount: model.amount,
            round: model.round,
            createdAt: model.createdAt,
        })
    }

    static toPersistence(entity: ProposalEntity): InferInsertModel<typeof proposal> {
        const { id, hireId, authorId, amount, round, createdAt } = entity.props
        return { id, hireId, authorId, amount, round, createdAt }
    }
}
