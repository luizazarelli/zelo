import type { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { asc, desc, eq } from 'drizzle-orm'
import { injectable } from 'tsyringe'
import { db } from '../connection'
import { ProposalMapper } from '../mappers/proposal.mapper'
import { proposal } from '../schema'

@injectable()
export class ProposalRepositoryImpl implements IProposalRepository {
    async create(entity: ProposalEntity): Promise<void> {
        const values = ProposalMapper.toPersistence(entity)
        await db.insert(proposal).values(values)
    }

    async listByHireId(hireId: string): Promise<ProposalEntity[]> {
        const rows = await db.select().from(proposal)
            .where(eq(proposal.hireId, hireId))
            .orderBy(asc(proposal.round))
        return rows.map(ProposalMapper.toDomain)
    }

    async findLatestByHireId(hireId: string): Promise<ProposalEntity | null> {
        const rows = await db.select().from(proposal)
            .where(eq(proposal.hireId, hireId))
            .orderBy(desc(proposal.round))
            .limit(1)
        return rows[0] ? ProposalMapper.toDomain(rows[0]) : null
    }
}
