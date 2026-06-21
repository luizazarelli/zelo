# Proposal Negotiation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a proposal/counter-proposal negotiation flow between client and worker before a hire is accepted, with unlimited negotiation rounds.

**Architecture:** A new `ProposalEntity` and `proposal` DB table track every offer; the `hire` table drops `pending` in favour of `negotiating`; three new use cases (`SubmitProposal`, `AcceptProposal`, `GetHireProposals`) drive the negotiation, while `CreateHireUsecase` atomically creates the hire + first proposal. The frontend gains a `HireRequestPage` for price entry and a dynamic negotiation banner in `ChatPage`.

**Tech Stack:** TypeScript, Fastify, Drizzle ORM (PostgreSQL), tsyringe DI, Zod, Vitest — React + Axios (frontend).

## Global Constraints

- All new backend files must follow the existing pattern: domain entity → repository interface → infra mapper + repo impl → use case → Zod DTO → controller.
- Controllers are auto-loaded by a glob pattern `'./**/controllers/*/**/*.controller.ts'` — no manual registration needed.
- DI tokens live in `back-end/src/infra/tokens.ts`; add new repository there.
- Unit tests go under `back-end/tst/unit/`, integration tests under `back-end/tst/integration/`.
- Run tests with `cd back-end && yarn vitest run --project unit` (unit) or `--project integration`.
- Frontend pages follow the existing inline-styles + hooks pattern; no external UI library.
- Never commit unless explicitly asked.

---

### Task 1: Domain — ProposalEntity + IProposalRepository + update HireEntity

**Files:**
- Create: `back-end/src/domain/entities/proposal.entity.ts`
- Create: `back-end/src/domain/repositories/proposal.repository.ts`
- Modify: `back-end/src/domain/entities/hire.entity.ts`
- Modify: `back-end/tst/unit/domain/entities/hire.entity.test.ts`
- Create: `back-end/tst/unit/domain/entities/proposal.entity.test.ts`

**Interfaces:**
- Produces: `ProposalEntity` with props `{ id, hireId, authorId, amount, round, createdAt }`, static `create` and `restore` constructors, read-only `props` getter.
- Produces: `IProposalRepository` with `create`, `listByHireId`, `findLatestByHireId`.
- Produces: `HireStatus = 'negotiating' | 'accepted' | 'completed' | 'cancelled'` (removes `'pending'`).
- Produces: `HireEntity.create()` defaults status to `'negotiating'`.

- [ ] **Step 1: Write the failing test for ProposalEntity**

```typescript
// back-end/tst/unit/domain/entities/proposal.entity.test.ts
import { describe, it, expect } from 'vitest'
import { ProposalEntity } from '@domain/entities/proposal.entity'

const makeProps = () => ({
    hireId: 'hire-uuid',
    authorId: 'author-uuid',
    amount: 150.00,
    round: 1,
})

describe('ProposalEntity — testes de unidade', () => {
    it('deve criar uma proposta com id e createdAt gerados', () => {
        const p = ProposalEntity.create(makeProps())
        expect(p.props.id).toBeDefined()
        expect(p.props.createdAt).toBeInstanceOf(Date)
        expect(p.props.amount).toBe(150.00)
        expect(p.props.round).toBe(1)
    })

    it('deve restaurar uma proposta a partir de dados persistidos', () => {
        const now = new Date()
        const p = ProposalEntity.restore({ id: 'p-1', hireId: 'h-1', authorId: 'a-1', amount: 200, round: 2, createdAt: now })
        expect(p.props.id).toBe('p-1')
        expect(p.props.round).toBe(2)
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd back-end && yarn vitest run --project unit tst/unit/domain/entities/proposal.entity.test.ts
```
Expected: FAIL with "Cannot find module '@domain/entities/proposal.entity'"

- [ ] **Step 3: Create ProposalEntity**

```typescript
// back-end/src/domain/entities/proposal.entity.ts
import { randomUUID } from 'node:crypto'

interface IProposalEntityProps {
    id: string
    hireId: string
    authorId: string
    amount: number
    round: number
    createdAt: Date
}

type CreateProposalProps = Omit<IProposalEntityProps, 'id' | 'createdAt'>

export class ProposalEntity {
    private constructor(private _props: IProposalEntityProps) {}

    static create(props: CreateProposalProps): ProposalEntity {
        return new ProposalEntity({
            id: randomUUID(),
            createdAt: new Date(),
            ...props,
        })
    }

    static restore(props: IProposalEntityProps): ProposalEntity {
        return new ProposalEntity(props)
    }

    get props(): Readonly<IProposalEntityProps> {
        return this._props
    }
}
```

- [ ] **Step 4: Create IProposalRepository**

```typescript
// back-end/src/domain/repositories/proposal.repository.ts
import type { ProposalEntity } from '@domain/entities/proposal.entity'

export interface IProposalRepository {
    create(proposal: ProposalEntity): Promise<void>
    listByHireId(hireId: string): Promise<ProposalEntity[]>
    findLatestByHireId(hireId: string): Promise<ProposalEntity | null>
}
```

- [ ] **Step 5: Update HireEntity — replace `pending` with `negotiating`, remove `accept` from UpdateHireStatus path**

Replace the entire file `back-end/src/domain/entities/hire.entity.ts`:

```typescript
import { randomUUID } from 'node:crypto'

export type HireStatus = 'negotiating' | 'accepted' | 'completed' | 'cancelled'

interface IHireEntityProps {
    id: string
    clientId: string
    workerId: string
    serviceTypeId: string
    description: string
    status: HireStatus
    createdAt: Date
    updatedAt: Date
}

type CreateHireProps = Omit<IHireEntityProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>

export class HireEntity {
    private constructor(private _props: IHireEntityProps) {}

    static create(props: CreateHireProps): HireEntity {
        const now = new Date()
        return new HireEntity({
            id: randomUUID(),
            status: 'negotiating',
            createdAt: now,
            updatedAt: now,
            ...props,
        })
    }

    static restore(props: IHireEntityProps): HireEntity {
        return new HireEntity(props)
    }

    accept(): void {
        this._props.status = 'accepted'
        this._props.updatedAt = new Date()
    }

    complete(): void {
        this._props.status = 'completed'
        this._props.updatedAt = new Date()
    }

    cancel(): void {
        this._props.status = 'cancelled'
        this._props.updatedAt = new Date()
    }

    get props(): Readonly<IHireEntityProps> {
        return this._props
    }
}
```

- [ ] **Step 6: Update hire.entity.test.ts to reflect `negotiating` status**

Replace the entire file `back-end/tst/unit/domain/entities/hire.entity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { HireEntity } from '@domain/entities/hire.entity'

const makeProps = () => ({
    clientId: 'client-uuid',
    workerId: 'worker-uuid',
    serviceTypeId: 'service-uuid',
    description: 'Serviço de elétrica',
})

describe('HireEntity — testes de unidade', () => {
    it('deve criar uma contratação com status negotiating', () => {
        const hire = HireEntity.create(makeProps())
        expect(hire.props.status).toBe('negotiating')
        expect(hire.props.id).toBeDefined()
        expect(hire.props.clientId).toBe('client-uuid')
        expect(hire.props.createdAt).toBeInstanceOf(Date)
    })

    it('deve aceitar uma contratação (negotiating → accepted)', () => {
        const hire = HireEntity.create(makeProps())
        hire.accept()
        expect(hire.props.status).toBe('accepted')
    })

    it('deve concluir uma contratação (accepted → completed)', () => {
        const hire = HireEntity.create(makeProps())
        hire.accept()
        hire.complete()
        expect(hire.props.status).toBe('completed')
    })

    it('deve cancelar uma contratação', () => {
        const hire = HireEntity.create(makeProps())
        hire.cancel()
        expect(hire.props.status).toBe('cancelled')
    })

    it('deve restaurar uma contratação a partir de dados persistidos', () => {
        const now = new Date()
        const hire = HireEntity.restore({
            id: 'hire-123',
            clientId: 'c1',
            workerId: 'w1',
            serviceTypeId: 's1',
            description: 'Pintura',
            status: 'accepted',
            createdAt: now,
            updatedAt: now,
        })
        expect(hire.props.id).toBe('hire-123')
        expect(hire.props.status).toBe('accepted')
    })
})
```

- [ ] **Step 7: Run all unit tests**

```bash
cd back-end && yarn vitest run --project unit
```
Expected: All PASS (both entity files green)

- [ ] **Step 8: Commit**

```bash
cd back-end && git add src/domain/entities/proposal.entity.ts src/domain/repositories/proposal.repository.ts src/domain/entities/hire.entity.ts tst/unit/domain/entities/hire.entity.test.ts tst/unit/domain/entities/proposal.entity.test.ts
git commit -m "feat: add ProposalEntity and IProposalRepository, replace pending status with negotiating"
```

---

### Task 2: Infra — schema, mapper, repository, tokens

**Files:**
- Modify: `back-end/src/infra/persistence/schema.ts`
- Create: `back-end/src/infra/persistence/mappers/proposal.mapper.ts`
- Create: `back-end/src/infra/persistence/repositories/proposal.repository.ts`
- Modify: `back-end/src/infra/tokens.ts`

**Interfaces:**
- Consumes: `ProposalEntity` from Task 1, `IProposalRepository` from Task 1
- Produces: `ProposalRepositoryImpl` registered as `INFRA.REPOSITORIES.PROPOSAL`
- Produces: Drizzle migration for the `proposal` table

- [ ] **Step 1: Add `proposal` table to schema**

In `back-end/src/infra/persistence/schema.ts`, add after the `payment` table definition (before the `relations` export):

```typescript
export const proposal = p.pgTable('proposal', {
    id: p.uuid().defaultRandom().primaryKey(),
    hireId: p.uuid('hire_id').references(() => hire.id, { onDelete: 'cascade' }).notNull(),
    authorId: p.uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    amount: p.doublePrecision().notNull(),
    round: p.integer().notNull(),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    p.index('proposal_hire_id_idx').on(table.hireId),
])
```

- [ ] **Step 2: Generate migration**

```bash
cd back-end && npx drizzle-kit generate
```
Expected: A new file appears under `back-end/drizzle/` with a `CREATE TABLE proposal` statement.

- [ ] **Step 3: Create ProposalMapper**

```typescript
// back-end/src/infra/persistence/mappers/proposal.mapper.ts
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
```

- [ ] **Step 4: Create ProposalRepositoryImpl**

```typescript
// back-end/src/infra/persistence/repositories/proposal.repository.ts
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
```

- [ ] **Step 5: Register in tokens**

In `back-end/src/infra/tokens.ts`, add the import and register the new repository:

```typescript
import { HashProviderImpl } from '@infra/providers/hash.provider'
import { container } from 'tsyringe'
import { HireRepositoryImpl } from './persistence/repositories/hire.repository'
import { MessageRepositoryImpl } from './persistence/repositories/message.repository'
import { PaymentRepositoryImpl } from './persistence/repositories/payment.repository'
import { ProposalRepositoryImpl } from './persistence/repositories/proposal.repository'
import { RefreshTokenImpl } from './persistence/repositories/refreshToken.repository'
import { ServiceTypeRepositoryImpl } from './persistence/repositories/serviceType.repository'
import UserRepositoryImpl from './persistence/repositories/user.repository'
import { WorkerPhotoRepositoryImpl } from './persistence/repositories/workerPhoto.repository'
import { WorkerRepositoryImpl } from './persistence/repositories/worker.repository'
import { JwtProviderImpl } from './providers/jwt.provider'

export const INFRA = {
    REPOSITORIES: {
        USER: UserRepositoryImpl,
        REFRESH_TOKEN: RefreshTokenImpl,
        WORKER: WorkerRepositoryImpl,
        WORKER_PHOTO: WorkerPhotoRepositoryImpl,
        SERVICE_TYPE: ServiceTypeRepositoryImpl,
        HIRE: HireRepositoryImpl,
        MESSAGE: MessageRepositoryImpl,
        PAYMENT: PaymentRepositoryImpl,
        PROPOSAL: ProposalRepositoryImpl,
    },
    PROVIDERS: {
        HASH: HashProviderImpl,
        JWT: JwtProviderImpl,
    },
}

for (const type in INFRA) {
    for (const [key, impl] of Object.entries(
        INFRA[type as keyof typeof INFRA]
    )) {
        container.register(key, impl)
    }
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd back-end && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
cd back-end && git add src/infra/persistence/schema.ts src/infra/persistence/mappers/proposal.mapper.ts src/infra/persistence/repositories/proposal.repository.ts src/infra/tokens.ts drizzle/
git commit -m "feat: add proposal table schema, mapper, repository and DI token"
```

---

### Task 3: Use cases — update CreateHire + new proposal errors + SubmitProposalUsecase

**Files:**
- Modify: `back-end/src/app/use-cases/hire/create-hire/create-hire.input.dto.ts`
- Modify: `back-end/src/app/use-cases/hire/create-hire/create-hire.output.dto.ts`
- Modify: `back-end/src/app/use-cases/hire/create-hire/create-hire.usecase.ts`
- Modify: `back-end/src/app/use-cases/hire/update-hire-status/update-hire-status.input.dto.ts`
- Modify: `back-end/src/app/use-cases/hire/update-hire-status/update-hire-status.usecase.ts`
- Create: `back-end/src/app/use-cases/proposal/_errors/not-your-turn.ts`
- Create: `back-end/src/app/use-cases/proposal/_errors/hire-not-negotiating.ts`
- Create: `back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.input.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.output.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.usecase.ts`
- Create: `back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.usecase.test.ts`

**Interfaces:**
- Consumes: `ProposalEntity`, `IProposalRepository` (Task 1), `HireEntity` with `negotiating` status (Task 1)
- Produces: `CreateHireUsecase.execute` now accepts `amount: number`, creates hire + proposal atomically, returns `proposalAmount`
- Produces: `UpdateHireStatusUsecase` only accepts `cancelled` and `completed`
- Produces: `SubmitProposalUsecase.execute({ hireId, authorId, amount })` → `{ id, hireId, authorId, amount, round, createdAt }`
- Produces: `NotYourTurn` (ApplicationError, 409), `HireNotNegotiating` (ApplicationError, 422)

- [ ] **Step 1: Write the failing test for SubmitProposalUsecase**

```typescript
// back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.usecase.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { HireEntity } from '@domain/entities/hire.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import { SubmitProposalUsecase } from './submit-proposal.usecase'

const clientId = randomUUID()
const workerId = randomUUID()

function makeHire(status: 'negotiating' | 'accepted' | 'cancelled' = 'negotiating') {
    const h = HireEntity.restore({
        id: randomUUID(), clientId, workerId,
        serviceTypeId: randomUUID(), description: 'Serviço',
        status, createdAt: new Date(), updatedAt: new Date(),
    })
    return h
}

class InMemoryHireRepo implements IHireRepository {
    private data = new Map<string, HireEntity>()
    async create(h: HireEntity) { this.data.set(h.props.id, h) }
    async save(h: HireEntity) { this.data.set(h.props.id, h) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async listByClientId(cId: string) { return [...this.data.values()].filter(h => h.props.clientId === cId) }
    async listByWorkerId(wId: string) { return [...this.data.values()].filter(h => h.props.workerId === wId) }
}

class InMemoryProposalRepo implements IProposalRepository {
    private data: ProposalEntity[] = []
    async create(p: ProposalEntity) { this.data.push(p) }
    async listByHireId(hireId: string) { return this.data.filter(p => p.props.hireId === hireId) }
    async findLatestByHireId(hireId: string) {
        const list = this.data.filter(p => p.props.hireId === hireId)
        return list.sort((a, b) => b.props.round - a.props.round)[0] ?? null
    }
}

describe('SubmitProposalUsecase', () => {
    let hireRepo: InMemoryHireRepo
    let proposalRepo: InMemoryProposalRepo
    let usecase: SubmitProposalUsecase

    beforeEach(() => {
        hireRepo = new InMemoryHireRepo()
        proposalRepo = new InMemoryProposalRepo()
        usecase = new SubmitProposalUsecase(hireRepo, proposalRepo)
    })

    it('worker pode submeter contra-proposta depois que o cliente propôs', async () => {
        const hire = makeHire()
        await hireRepo.create(hire)
        const firstProposal = ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 100, round: 1 })
        await proposalRepo.create(firstProposal)

        const result = await usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 120 })

        expect(result.round).toBe(2)
        expect(result.amount).toBe(120)
        expect(result.authorId).toBe(workerId)
    })

    it('lança NotYourTurn se o mesmo autor tenta propor duas vezes seguidas', async () => {
        const hire = makeHire()
        await hireRepo.create(hire)
        const firstProposal = ProposalEntity.create({ hireId: hire.props.id, authorId: workerId, amount: 100, round: 1 })
        await proposalRepo.create(firstProposal)

        await expect(
            usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 80 })
        ).rejects.toThrow('Não é sua vez de propor')
    })

    it('lança HireNotNegotiating se o hire não está em negociação', async () => {
        const hire = makeHire('accepted')
        await hireRepo.create(hire)

        await expect(
            usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 80 })
        ).rejects.toThrow('Contratação não está em negociação')
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd back-end && yarn vitest run --project unit src/app/use-cases/proposal/submit-proposal/submit-proposal.usecase.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create error classes**

```typescript
// back-end/src/app/use-cases/proposal/_errors/not-your-turn.ts
import { ApplicationError } from '@application/use-cases/_errors/applicationError'

export class NotYourTurn extends ApplicationError {
    constructor() {
        super('Não é sua vez de propor', 409)
    }
}
```

```typescript
// back-end/src/app/use-cases/proposal/_errors/hire-not-negotiating.ts
import { ApplicationError } from '@application/use-cases/_errors/applicationError'

export class HireNotNegotiating extends ApplicationError {
    constructor() {
        super('Contratação não está em negociação', 422)
    }
}
```

- [ ] **Step 4: Create SubmitProposal DTOs**

```typescript
// back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.input.dto.ts
import z from 'zod'

export const SubmitProposalInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    authorId: z.uuid('ID do autor inválido'),
    amount: z.number().positive('O valor deve ser positivo'),
})

export type SubmitProposalInputDto = z.infer<typeof SubmitProposalInputDto>
```

```typescript
// back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.output.dto.ts
export interface SubmitProposalOutputDto {
    id: string
    hireId: string
    authorId: string
    amount: number
    round: number
    createdAt: Date
}
```

- [ ] **Step 5: Create SubmitProposalUsecase**

```typescript
// back-end/src/app/use-cases/proposal/submit-proposal/submit-proposal.usecase.ts
import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import { HireNotNegotiating } from '@application/use-cases/proposal/_errors/hire-not-negotiating'
import { NotYourTurn } from '@application/use-cases/proposal/_errors/not-your-turn'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { SubmitProposalInputDto } from './submit-proposal.input.dto'
import type { SubmitProposalOutputDto } from './submit-proposal.output.dto'

@injectable()
export class SubmitProposalUsecase implements BaseUsecase<SubmitProposalInputDto, SubmitProposalOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId, authorId, amount }: SubmitProposalInputDto): Promise<SubmitProposalOutputDto> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()
        if (hire.props.status !== 'negotiating') throw new HireNotNegotiating()

        const latest = await this.proposalRepository.findLatestByHireId(hireId)
        if (latest && latest.props.authorId === authorId) throw new NotYourTurn()

        const nextRound = latest ? latest.props.round + 1 : 1
        const proposal = ProposalEntity.create({ hireId, authorId, amount, round: nextRound })
        await this.proposalRepository.create(proposal)

        return {
            id: proposal.props.id,
            hireId: proposal.props.hireId,
            authorId: proposal.props.authorId,
            amount: proposal.props.amount,
            round: proposal.props.round,
            createdAt: proposal.props.createdAt,
        }
    }
}
```

- [ ] **Step 6: Update CreateHireInputDto**

Replace `back-end/src/app/use-cases/hire/create-hire/create-hire.input.dto.ts`:

```typescript
import z from 'zod'

export const CreateHireInputDto = z.object({
    clientId: z.uuid('ID do cliente inválido'),
    workerId: z.uuid('ID do profissional inválido'),
    serviceTypeId: z.uuid('ID do tipo de serviço inválido'),
    description: z.string().min(10, 'Descrição muito curta'),
    amount: z.number().positive('O valor deve ser positivo'),
})

export type CreateHireInputDto = z.infer<typeof CreateHireInputDto>
```

- [ ] **Step 7: Update CreateHireOutputDto**

Replace `back-end/src/app/use-cases/hire/create-hire/create-hire.output.dto.ts`:

```typescript
export interface CreateHireOutputDto {
    id: string
    status: string
    createdAt: Date
    proposalAmount: number
}
```

- [ ] **Step 8: Update CreateHireUsecase**

Replace `back-end/src/app/use-cases/hire/create-hire/create-hire.usecase.ts`:

```typescript
import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error'
import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireEntity } from '@domain/entities/hire.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import { WorkerNotFound } from '@application/use-cases/worker/_errors/worker-not-found'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { CreateHireInputDto } from './create-hire.input.dto'
import type { CreateHireOutputDto } from './create-hire.output.dto'

@injectable()
export class CreateHireUsecase implements BaseUsecase<CreateHireInputDto, CreateHireOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository,
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ clientId, workerId, serviceTypeId, description, amount }: CreateHireInputDto): Promise<CreateHireOutputDto> {
        const [client, worker] = await Promise.all([
            this.userRepository.findById(clientId),
            this.workerRepository.findById(workerId),
        ])
        if (!client) throw new UserNotFound()
        if (!worker) throw new WorkerNotFound()

        const hireEntity = HireEntity.create({ clientId, workerId, serviceTypeId, description })
        await this.hireRepository.create(hireEntity)

        const proposalEntity = ProposalEntity.create({
            hireId: hireEntity.props.id,
            authorId: clientId,
            amount,
            round: 1,
        })
        await this.proposalRepository.create(proposalEntity)

        return {
            id: hireEntity.props.id,
            status: hireEntity.props.status,
            createdAt: hireEntity.props.createdAt,
            proposalAmount: amount,
        }
    }
}
```

- [ ] **Step 9: Update UpdateHireStatusInputDto — remove `accepted`**

Replace `back-end/src/app/use-cases/hire/update-hire-status/update-hire-status.input.dto.ts`:

```typescript
import z from 'zod'

export const UpdateHireStatusInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    status: z.enum(['completed', 'cancelled']),
})

export type UpdateHireStatusInputDto = z.infer<typeof UpdateHireStatusInputDto>
```

- [ ] **Step 10: Update UpdateHireStatusUsecase — remove `accepted` branch**

Replace `back-end/src/app/use-cases/hire/update-hire-status/update-hire-status.usecase.ts`:

```typescript
import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { UpdateHireStatusInputDto } from './update-hire-status.input.dto'

@injectable()
export class UpdateHireStatusUsecase implements BaseUsecase<UpdateHireStatusInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
    ) {}

    async execute({ hireId, status }: UpdateHireStatusInputDto): Promise<void> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()

        if (status === 'completed') hire.complete()
        else hire.cancel()

        await this.hireRepository.save(hire)
    }
}
```

- [ ] **Step 11: Run unit tests**

```bash
cd back-end && yarn vitest run --project unit
```
Expected: All PASS

- [ ] **Step 12: Commit**

```bash
cd back-end && git add src/app/use-cases/hire/create-hire/ src/app/use-cases/hire/update-hire-status/ src/app/use-cases/proposal/
git commit -m "feat: update CreateHire to create initial proposal, add SubmitProposalUsecase"
```

---

### Task 4: Use cases — AcceptProposalUsecase + GetHireProposalsUsecase

**Files:**
- Create: `back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.input.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.output.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.usecase.ts`
- Create: `back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.usecase.test.ts`
- Create: `back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.input.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.output.dto.ts`
- Create: `back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.usecase.ts`

**Interfaces:**
- Consumes: `HireNotNegotiating`, `NotYourTurn` (Task 3), `IHireRepository`, `IProposalRepository` (Tasks 1–2)
- Produces: `AcceptProposalUsecase.execute({ hireId, acceptorId })` → `{ agreedAmount: number }`
- Produces: `GetHireProposalsUsecase.execute({ hireId })` → `{ proposals: Array<{ id, hireId, authorId, amount, round, createdAt }> }`

- [ ] **Step 1: Write the failing test for AcceptProposalUsecase**

```typescript
// back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.usecase.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { HireEntity } from '@domain/entities/hire.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { AcceptProposalUsecase } from './accept-proposal.usecase'

const clientId = randomUUID()
const workerId = randomUUID()

class InMemoryHireRepo implements IHireRepository {
    private data = new Map<string, HireEntity>()
    async create(h: HireEntity) { this.data.set(h.props.id, h) }
    async save(h: HireEntity) { this.data.set(h.props.id, h) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async listByClientId(cId: string) { return [...this.data.values()].filter(h => h.props.clientId === cId) }
    async listByWorkerId(wId: string) { return [...this.data.values()].filter(h => h.props.workerId === wId) }
}

class InMemoryProposalRepo implements IProposalRepository {
    private data: ProposalEntity[] = []
    async create(p: ProposalEntity) { this.data.push(p) }
    async listByHireId(hireId: string) { return this.data.filter(p => p.props.hireId === hireId) }
    async findLatestByHireId(hireId: string) {
        const list = this.data.filter(p => p.props.hireId === hireId)
        return list.sort((a, b) => b.props.round - a.props.round)[0] ?? null
    }
}

describe('AcceptProposalUsecase', () => {
    let hireRepo: InMemoryHireRepo
    let proposalRepo: InMemoryProposalRepo
    let usecase: AcceptProposalUsecase

    beforeEach(() => {
        hireRepo = new InMemoryHireRepo()
        proposalRepo = new InMemoryProposalRepo()
        usecase = new AcceptProposalUsecase(hireRepo, proposalRepo)
    })

    it('worker pode aceitar proposta do cliente e hire fica accepted', async () => {
        const hire = HireEntity.restore({
            id: randomUUID(), clientId, workerId,
            serviceTypeId: randomUUID(), description: 'Serviço',
            status: 'negotiating', createdAt: new Date(), updatedAt: new Date(),
        })
        await hireRepo.create(hire)
        await proposalRepo.create(ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 150, round: 1 }))

        const result = await usecase.execute({ hireId: hire.props.id, acceptorId: workerId })

        expect(result.agreedAmount).toBe(150)
        const updated = await hireRepo.findById(hire.props.id)
        expect(updated?.props.status).toBe('accepted')
    })

    it('lança NotYourTurn se o autor da última proposta tenta aceitar a própria proposta', async () => {
        const hire = HireEntity.restore({
            id: randomUUID(), clientId, workerId,
            serviceTypeId: randomUUID(), description: 'Serviço',
            status: 'negotiating', createdAt: new Date(), updatedAt: new Date(),
        })
        await hireRepo.create(hire)
        await proposalRepo.create(ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 150, round: 1 }))

        await expect(
            usecase.execute({ hireId: hire.props.id, acceptorId: clientId })
        ).rejects.toThrow('Não é sua vez de propor')
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd back-end && yarn vitest run --project unit src/app/use-cases/proposal/accept-proposal/accept-proposal.usecase.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create AcceptProposal DTOs and usecase**

```typescript
// back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.input.dto.ts
import z from 'zod'

export const AcceptProposalInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
    acceptorId: z.uuid('ID do aceitante inválido'),
})

export type AcceptProposalInputDto = z.infer<typeof AcceptProposalInputDto>
```

```typescript
// back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.output.dto.ts
export interface AcceptProposalOutputDto {
    agreedAmount: number
}
```

```typescript
// back-end/src/app/use-cases/proposal/accept-proposal/accept-proposal.usecase.ts
import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import { HireNotNegotiating } from '@application/use-cases/proposal/_errors/hire-not-negotiating'
import { NotYourTurn } from '@application/use-cases/proposal/_errors/not-your-turn'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { AcceptProposalInputDto } from './accept-proposal.input.dto'
import type { AcceptProposalOutputDto } from './accept-proposal.output.dto'

@injectable()
export class AcceptProposalUsecase implements BaseUsecase<AcceptProposalInputDto, AcceptProposalOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId, acceptorId }: AcceptProposalInputDto): Promise<AcceptProposalOutputDto> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()
        if (hire.props.status !== 'negotiating') throw new HireNotNegotiating()

        const latest = await this.proposalRepository.findLatestByHireId(hireId)
        if (!latest || latest.props.authorId === acceptorId) throw new NotYourTurn()

        hire.accept()
        await this.hireRepository.save(hire)

        return { agreedAmount: latest.props.amount }
    }
}
```

- [ ] **Step 4: Create GetHireProposals DTOs and usecase**

```typescript
// back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.input.dto.ts
import z from 'zod'

export const GetHireProposalsInputDto = z.object({
    hireId: z.uuid('ID da contratação inválido'),
})

export type GetHireProposalsInputDto = z.infer<typeof GetHireProposalsInputDto>
```

```typescript
// back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.output.dto.ts
export interface GetHireProposalsOutputDto {
    proposals: {
        id: string
        hireId: string
        authorId: string
        amount: number
        round: number
        createdAt: Date
    }[]
}
```

```typescript
// back-end/src/app/use-cases/proposal/get-hire-proposals/get-hire-proposals.usecase.ts
import type BaseUsecase from '@application/use-cases/base.usecase'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { GetHireProposalsInputDto } from './get-hire-proposals.input.dto'
import type { GetHireProposalsOutputDto } from './get-hire-proposals.output.dto'

@injectable()
export class GetHireProposalsUsecase implements BaseUsecase<GetHireProposalsInputDto, GetHireProposalsOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId }: GetHireProposalsInputDto): Promise<GetHireProposalsOutputDto> {
        const proposals = await this.proposalRepository.listByHireId(hireId)
        return {
            proposals: proposals.map(p => ({
                id: p.props.id,
                hireId: p.props.hireId,
                authorId: p.props.authorId,
                amount: p.props.amount,
                round: p.props.round,
                createdAt: p.props.createdAt,
            })),
        }
    }
}
```

- [ ] **Step 5: Run unit tests**

```bash
cd back-end && yarn vitest run --project unit
```
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
cd back-end && git add src/app/use-cases/proposal/
git commit -m "feat: add AcceptProposalUsecase and GetHireProposalsUsecase"
```

---

### Task 5: Update ListHiresUsecase + fix integration test

**Files:**
- Modify: `back-end/src/app/use-cases/hire/list-hires/list-hires.input.dto.ts`
- Modify: `back-end/src/app/use-cases/hire/list-hires/list-hires.output.dto.ts`
- Modify: `back-end/src/app/use-cases/hire/list-hires/list-hires.usecase.ts`
- Modify: `back-end/tst/integration/hire-lifecycle.integration.test.ts`

**Interfaces:**
- Consumes: `IProposalRepository` (Task 1), `SubmitProposalUsecase` (Task 3), `AcceptProposalUsecase` (Task 4)
- Produces: `ListHiresOutputDto` items include `latestProposalAmount: number | null` and `latestProposalAuthorId: string | null`

- [ ] **Step 1: Update ListHiresInputDto**

Replace `back-end/src/app/use-cases/hire/list-hires/list-hires.input.dto.ts`:

```typescript
import z from 'zod'

export const ListHiresInputDto = z.object({
    userId: z.uuid('ID de usuário inválido'),
    role: z.enum(['client', 'worker']),
    status: z.enum(['negotiating', 'accepted', 'completed', 'cancelled']).optional(),
})

export type ListHiresInputDto = z.infer<typeof ListHiresInputDto>
```

- [ ] **Step 2: Update ListHiresOutputDto**

Replace `back-end/src/app/use-cases/hire/list-hires/list-hires.output.dto.ts`:

```typescript
export interface ListHiresOutputDto {
    hires: {
        id: string
        clientId: string
        clientName: string
        workerId: string
        serviceTypeId: string
        description: string
        status: string
        createdAt: Date
        latestProposalAmount: number | null
        latestProposalAuthorId: string | null
    }[]
}
```

- [ ] **Step 3: Update ListHiresUsecase to inject ProposalRepository and populate proposal fields**

Replace `back-end/src/app/use-cases/hire/list-hires/list-hires.usecase.ts`:

```typescript
import type BaseUsecase from '@application/use-cases/base.usecase'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { ListHiresInputDto } from './list-hires.input.dto'
import type { ListHiresOutputDto } from './list-hires.output.dto'

@injectable()
export class ListHiresUsecase implements BaseUsecase<ListHiresInputDto, ListHiresOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ userId, role, status }: ListHiresInputDto): Promise<ListHiresOutputDto> {
        const hires = role === 'client'
            ? await this.hireRepository.listByClientId(userId, status)
            : await this.hireRepository.listByWorkerId(userId, status)

        const clientIds = [...new Set(hires.map((h) => h.props.clientId))]
        const clients = await this.userRepository.searchByIds(clientIds)
        const clientMap = new Map(clients.map((u) => [u.props.id, u.props.name]))

        const latestProposals = await Promise.all(
            hires.map(h => this.proposalRepository.findLatestByHireId(h.props.id))
        )

        return {
            hires: hires.map((h, i) => ({
                id: h.props.id,
                clientId: h.props.clientId,
                clientName: clientMap.get(h.props.clientId) ?? 'Cliente',
                workerId: h.props.workerId,
                serviceTypeId: h.props.serviceTypeId,
                description: h.props.description,
                status: h.props.status,
                createdAt: h.props.createdAt,
                latestProposalAmount: latestProposals[i]?.props.amount ?? null,
                latestProposalAuthorId: latestProposals[i]?.props.authorId ?? null,
            })),
        }
    }
}
```

- [ ] **Step 4: Rewrite the integration test to reflect the new flow**

Replace `back-end/tst/integration/hire-lifecycle.integration.test.ts`:

```typescript
import type { HireEntity } from '@domain/entities/hire.entity'
import { PaymentEntity } from '@domain/entities/payment.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IPaymentRepository } from '@domain/repositories/payment.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import UserEntity from '@domain/entities/user.entity'
import { WorkerEntity } from '@domain/entities/worker.entity'
import { CreateHireUsecase } from '@application/use-cases/hire/create-hire/create-hire.usecase'
import { SubmitProposalUsecase } from '@application/use-cases/proposal/submit-proposal/submit-proposal.usecase'
import { AcceptProposalUsecase } from '@application/use-cases/proposal/accept-proposal/accept-proposal.usecase'
import { ProcessPaymentUsecase } from '@application/use-cases/payment/process-payment/process-payment.usecase'
import { describe, beforeEach, it, expect } from 'vitest'
import { randomUUID } from 'node:crypto'

class InMemoryUserRepository implements IUserRepository {
    private data = new Map<string, UserEntity>()
    async create(user: UserEntity) { this.data.set(user.props.id, user) }
    async update(user: UserEntity) { this.data.set(user.props.id, user) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async findByEmail(email: string) {
        return [...this.data.values()].find(u => u.props.email === email) ?? null
    }
    async searchByIds(ids: string[]) {
        return ids.flatMap(id => { const u = this.data.get(id); return u ? [u] : [] })
    }
}

class InMemoryWorkerRepository implements IWorkerRepository {
    private data = new Map<string, WorkerEntity>()
    async create(worker: WorkerEntity) { this.data.set(worker.props.userId, worker) }
    async save(worker: WorkerEntity) { this.data.set(worker.props.userId, worker) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async search() { return [...this.data.values()] }
}

class InMemoryHireRepository implements IHireRepository {
    private data = new Map<string, HireEntity>()
    async create(hire: HireEntity) { this.data.set(hire.props.id, hire) }
    async save(hire: HireEntity) { this.data.set(hire.props.id, hire) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async listByClientId(clientId: string) {
        return [...this.data.values()].filter(h => h.props.clientId === clientId)
    }
    async listByWorkerId(workerId: string) {
        return [...this.data.values()].filter(h => h.props.workerId === workerId)
    }
}

class InMemoryProposalRepository implements IProposalRepository {
    private data: ProposalEntity[] = []
    async create(p: ProposalEntity) { this.data.push(p) }
    async listByHireId(hireId: string) { return this.data.filter(p => p.props.hireId === hireId) }
    async findLatestByHireId(hireId: string) {
        const list = this.data.filter(p => p.props.hireId === hireId)
        return list.sort((a, b) => b.props.round - a.props.round)[0] ?? null
    }
}

class InMemoryPaymentRepository implements IPaymentRepository {
    private data = new Map<string, PaymentEntity>()
    async create(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async save(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async findByHireId(hireId: string) {
        return [...this.data.values()].find(p => p.props.hireId === hireId) ?? null
    }
}

describe('Integração — ciclo completo de contratação com negociação', () => {
    let userRepo: InMemoryUserRepository
    let workerRepo: InMemoryWorkerRepository
    let hireRepo: InMemoryHireRepository
    let proposalRepo: InMemoryProposalRepository
    let paymentRepo: InMemoryPaymentRepository

    let createHire: CreateHireUsecase
    let submitProposal: SubmitProposalUsecase
    let acceptProposal: AcceptProposalUsecase
    let processPayment: ProcessPaymentUsecase

    let clientId: string
    let workerId: string
    const serviceTypeId = randomUUID()

    beforeEach(async () => {
        userRepo = new InMemoryUserRepository()
        workerRepo = new InMemoryWorkerRepository()
        hireRepo = new InMemoryHireRepository()
        proposalRepo = new InMemoryProposalRepository()
        paymentRepo = new InMemoryPaymentRepository()

        createHire = new CreateHireUsecase(userRepo, workerRepo, hireRepo, proposalRepo)
        submitProposal = new SubmitProposalUsecase(hireRepo, proposalRepo)
        acceptProposal = new AcceptProposalUsecase(hireRepo, proposalRepo)
        processPayment = new ProcessPaymentUsecase(hireRepo, paymentRepo)

        const client = UserEntity.create({
            name: 'Cliente Teste',
            email: 'cliente@uel.br',
            phone: '43999999999',
            password: 'hash',
        })
        clientId = client.props.id
        await userRepo.create(client)

        const worker = WorkerEntity.create({
            userId: randomUUID(),
            description: 'Eletricista experiente',
            workingSince: new Date('2018-01-01'),
            serviceTypes: [],
        })
        workerId = worker.props.userId
        await workerRepo.create(worker)
    })

    it('fluxo direto: cliente propõe → worker aceita → paga', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Instalação elétrica',
            amount: 450,
        })
        expect(hire.status).toBe('negotiating')
        expect(hire.proposalAmount).toBe(450)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: workerId })
        expect(agreedAmount).toBe(450)

        const hireAfterAccept = await hireRepo.findById(hire.id)
        expect(hireAfterAccept?.props.status).toBe('accepted')

        const payment = await processPayment.execute({ hireId: hire.id, amount: agreedAmount })
        expect(payment.status).toBe('paid')
        expect(payment.amount).toBe(450)
    })

    it('fluxo com contra-proposta: cliente → worker counter → cliente aceita', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Pintura completa',
            amount: 300,
        })

        const counter = await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 380 })
        expect(counter.round).toBe(2)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: clientId })
        expect(agreedAmount).toBe(380)
    })

    it('múltiplas rodadas de negociação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Reforma completa do banheiro',
            amount: 500,
        })

        await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 700 })
        await submitProposal.execute({ hireId: hire.id, authorId: clientId, amount: 600 })
        const final = await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 650 })
        expect(final.round).toBe(4)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: clientId })
        expect(agreedAmount).toBe(650)
    })

    it('não deve processar pagamento se a contratação está em negociação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Serviço de pintura',
            amount: 100,
        })

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 100 })
        ).rejects.toThrow('A contratação precisa estar aceita para prosseguir')
    })

    it('não deve pagar duas vezes a mesma contratação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Encanamento completo',
            amount: 200,
        })
        await acceptProposal.execute({ hireId: hire.id, acceptorId: workerId })

        const pagamentoExistente = PaymentEntity.create({ hireId: hire.id, amount: 200 })
        pagamentoExistente.pay()
        await paymentRepo.create(pagamentoExistente)

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 200 })
        ).rejects.toThrow('Esta contratação já possui um pagamento registrado')
    })
})
```

- [ ] **Step 5: Run all tests**

```bash
cd back-end && yarn vitest run --project unit && yarn vitest run --project integration
```
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
cd back-end && git add src/app/use-cases/hire/list-hires/ tst/integration/hire-lifecycle.integration.test.ts
git commit -m "feat: update ListHiresUsecase with proposal data, rewrite integration tests for negotiation flow"
```

---

### Task 6: HTTP controllers for proposals

**Files:**
- Create: `back-end/src/presentation/http/controllers/proposal/submitProposal.controller.ts`
- Create: `back-end/src/presentation/http/controllers/proposal/acceptProposal.controller.ts`
- Create: `back-end/src/presentation/http/controllers/proposal/getHireProposals.controller.ts`

**Interfaces:**
- Consumes: `SubmitProposalUsecase`, `AcceptProposalUsecase`, `GetHireProposalsUsecase` (Tasks 3–4)
- Produces: REST endpoints at `/api/v1/hire/:hireId/proposal` (POST), `/api/v1/hire/:hireId/proposal/accept` (PATCH), `/api/v1/hire/:hireId/proposal` (GET)

Note: Controllers are auto-loaded by the glob `'./**/controllers/*/**/*.controller.ts'` — no manual registration needed.

- [ ] **Step 1: Create submitProposal.controller.ts**

```typescript
// back-end/src/presentation/http/controllers/proposal/submitProposal.controller.ts
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
```

- [ ] **Step 2: Create acceptProposal.controller.ts**

```typescript
// back-end/src/presentation/http/controllers/proposal/acceptProposal.controller.ts
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
```

- [ ] **Step 3: Create getHireProposals.controller.ts**

```typescript
// back-end/src/presentation/http/controllers/proposal/getHireProposals.controller.ts
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd back-end && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd back-end && git add src/presentation/http/controllers/proposal/
git commit -m "feat: add proposal HTTP controllers (submit, accept, list)"
```

---

### Task 7: Frontend — HireRequestPage, routing, api.js

**Files:**
- Modify: `front-end/src/api/api.js`
- Create: `front-end/src/pages/hire/HireRequestPage.jsx`
- Modify: `front-end/src/App.jsx`
- Modify: `front-end/src/pages/workers/WorkerProfilePage.jsx`

**Interfaces:**
- Produces: `hireApi.submitProposal(hireId, { authorId, amount })`, `hireApi.acceptProposal(hireId, { acceptorId })`, `hireApi.getProposals(hireId)`
- Produces: `/hire-request` route that shows description + price form, creates hire, navigates to `/chat`
- Produces: `WorkerProfilePage` navigates to `/hire-request` instead of calling API directly

- [ ] **Step 1: Add proposal calls to api.js**

In `front-end/src/api/api.js`, replace the `hireApi` export:

```javascript
export const hireApi = {
  create: (data) => api.post('/hire', data),
  list: (userId, role, status) => api.get('/hire', { params: { userId, role, ...(status && { status }) } }),
  previous: (userId, role) => api.get('/hire/previous', { params: { userId, role } }),
  updateStatus: (hireId, status) => api.patch(`/hire/${hireId}/status`, { status }),
  submitProposal: (hireId, data) => api.post(`/hire/${hireId}/proposal`, data),
  acceptProposal: (hireId, data) => api.patch(`/hire/${hireId}/proposal/accept`, data),
  getProposals: (hireId) => api.get(`/hire/${hireId}/proposal`),
}
```

- [ ] **Step 2: Create HireRequestPage.jsx**

```jsx
// front-end/src/pages/hire/HireRequestPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function HireRequestPage() {
  const { state } = useLocation()
  const { worker } = state || {}
  const { user } = useAuth()
  const navigate = useNavigate()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const fmtAmount = (v) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return ''
    const num = (parseInt(digits, 10) / 100).toFixed(2)
    return num.replace('.', ',')
  }

  const parsedAmount = parseFloat((amount || '0').replace(',', '.'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (description.trim().length < 10) {
      toast.error('Descreva o serviço com pelo menos 10 caracteres')
      return
    }
    if (parsedAmount <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    setLoading(true)
    try {
      const serviceTypeId = worker?.serviceTypeIds?.[0] ?? ''
      const { data } = await hireApi.create({
        clientId: user.id,
        workerId: worker.id,
        serviceTypeId,
        description: description.trim(),
        amount: parsedAmount,
      })
      navigate('/chat', { state: { worker, hire: data.data, isWorkerView: false } })
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!worker) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
      Profissional não encontrado
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <p style={s.title}>Solicitar serviço</p>
      </div>

      <div style={s.workerRow}>
        <div style={s.avatar}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div>
          <p style={s.workerName}>{worker.name}</p>
          <p style={s.workerType}>{worker.serviceTypes?.[0] || 'Profissional'}</p>
        </div>
      </div>

      <form style={s.form} onSubmit={handleSubmit}>
        <label style={s.label}>Descreva o serviço</label>
        <textarea
          style={s.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Preciso instalar 3 tomadas e trocar 2 interruptores no quarto..."
          rows={4}
        />

        <label style={s.label}>Seu valor proposto</label>
        <div style={s.amountRow}>
          <span style={s.currency}>R$</span>
          <input
            style={s.amountInput}
            value={amount}
            onChange={e => setAmount(fmtAmount(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
          />
        </div>
        <p style={s.hint}>O profissional pode aceitar ou fazer uma contra-proposta.</p>

        <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '48px 20px 16px', borderBottom: '0.5px solid rgba(60,60,60,0.12)',
  },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  title: { fontSize: 17, fontWeight: '600', color: '#252525', margin: 0 },
  workerRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 24px', borderBottom: '0.5px solid rgba(60,60,60,0.12)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, background: '#38b31f',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  workerName: { fontWeight: '600', fontSize: 14, color: '#252525', margin: 0 },
  workerType: { fontSize: 12, color: '#3c3c3c', margin: 0 },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#252525', marginBottom: 4 },
  textarea: {
    border: '0.5px solid rgba(60,60,60,0.4)', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#252525',
    background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    marginBottom: 12,
  },
  amountRow: {
    display: 'flex', alignItems: 'center',
    border: '0.5px solid rgba(60,60,60,0.4)', borderRadius: 8,
    background: '#fff', overflow: 'hidden', marginBottom: 4,
  },
  currency: {
    padding: '10px 12px', fontSize: 14, fontWeight: '600',
    color: '#38b31f', borderRight: '0.5px solid rgba(60,60,60,0.2)', background: '#f4faf2',
  },
  amountInput: {
    flex: 1, border: 'none', padding: '10px 12px',
    fontSize: 18, fontWeight: '700', color: '#252525',
    outline: 'none', background: 'transparent',
  },
  hint: { fontSize: 11, color: '#888', margin: '0 0 20px', lineHeight: 1.4 },
  btn: {
    background: '#38b31f', color: '#fff', border: 'none',
    borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: '700',
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(56,179,31,0.3)',
  },
  btnDisabled: { opacity: 0.7, cursor: 'default' },
}
```

- [ ] **Step 3: Add `/hire-request` route to App.jsx**

In `front-end/src/App.jsx`, add the import and route:

```jsx
import HireRequestPage from './pages/hire/HireRequestPage'
```

And inside `<Routes>`, add after the `/workers/:id` route:

```jsx
<Route path="/hire-request" element={<PrivateRoute><HireRequestPage /></PrivateRoute>} />
```

- [ ] **Step 4: Update WorkerProfilePage to navigate to HireRequestPage instead of calling API**

In `front-end/src/pages/workers/WorkerProfilePage.jsx`, replace the `handleHire` function and button:

```jsx
const handleHire = () => {
  navigate('/hire-request', { state: { worker } })
}
```

Remove `useState` for `loading` and `hireApi` import (if `hireApi` is no longer used in this file).

Also remove `toast` import if no longer needed, and update the button:

```jsx
<button style={s.hireBtn} onClick={handleHire}>
  Solicitar Orçamento
</button>
```

- [ ] **Step 5: Verify dev server starts without errors**

```bash
cd front-end && yarn dev
```
Expected: Vite starts, browser loads, clicking "Solicitar Orçamento" on a worker profile navigates to `/hire-request`.

- [ ] **Step 6: Commit**

```bash
cd front-end && git add src/api/api.js src/pages/hire/HireRequestPage.jsx src/App.jsx src/pages/workers/WorkerProfilePage.jsx
git commit -m "feat: add HireRequestPage with description and price fields, wire routing"
```

---

### Task 8: Frontend — ChatPage negotiation banner

**Files:**
- Modify: `front-end/src/pages/hire/ChatPage.jsx`

**Interfaces:**
- Consumes: `hireApi.getProposals`, `hireApi.submitProposal`, `hireApi.acceptProposal`, `hireApi.updateStatus` (Task 7)
- Produces: Dynamic banner between header and messages; polls proposals every 3s alongside messages; inline counter-proposal input on demand

- [ ] **Step 1: Replace ChatPage.jsx**

```jsx
// front-end/src/pages/hire/ChatPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { messageApi, hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

function WorkerAvatar() {
  return (
    <div style={av.wrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  )
}

const av = {
  wrap: {
    width: 49, height: 48, background: '#38b31f', borderRadius: 90,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
}

const chatKey = (hireId) => `zelo_chat_${hireId}`
const saveLocal = (hireId, msgs) => { try { localStorage.setItem(chatKey(hireId), JSON.stringify(msgs)) } catch {} }
const readLocal = (hireId) => { try { return JSON.parse(localStorage.getItem(chatKey(hireId)) || '[]') } catch { return [] } }

const fmtBRL = (n) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function NegotiationBanner({ hire, proposals, isWorkerView, user, onAccept, onCounter, onCancel }) {
  const [showInput, setShowInput] = useState(false)
  const [counterVal, setCounterVal] = useState('')

  const latest = proposals.length > 0 ? proposals[proposals.length - 1] : null
  const isMyTurn = latest ? latest.authorId !== user.id : false

  const fmtCounter = (v) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return ''
    return (parseInt(digits, 10) / 100).toFixed(2).replace('.', ',')
  }

  const handleConfirmCounter = () => {
    const val = parseFloat((counterVal || '0').replace(',', '.'))
    if (val <= 0) { toast.error('Informe um valor válido'); return }
    onCounter(val)
    setShowInput(false)
    setCounterVal('')
  }

  if (hire?.status === 'cancelled') {
    return (
      <div style={bn.cancelled}>
        <p style={bn.cancelledText}>Contratação cancelada</p>
      </div>
    )
  }

  if (hire?.status === 'accepted') {
    return (
      <div style={bn.accepted}>
        <p style={bn.acceptedText}>
          Proposta aceita — R$ {fmtBRL(latest?.amount ?? 0)}
        </p>
        {!isWorkerView && (
          <button style={bn.payBtn} onClick={() => onAccept()}>Pagar</button>
        )}
        {isWorkerView && (
          <p style={bn.waitingPay}>Aguardando pagamento</p>
        )}
      </div>
    )
  }

  if (!latest) return null

  if (!isMyTurn) {
    return (
      <div style={bn.waiting}>
        <p style={bn.waitingText}>Aguardando resposta — sua proposta: R$ {fmtBRL(latest.amount)}</p>
      </div>
    )
  }

  if (showInput) {
    return (
      <div style={bn.inputBanner}>
        <span style={bn.inputLabel}>Seu valor:</span>
        <div style={bn.inputRow}>
          <span style={bn.inputCurrency}>R$</span>
          <input
            style={bn.inputField}
            value={counterVal}
            onChange={e => setCounterVal(fmtCounter(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
            autoFocus
          />
        </div>
        <button style={bn.confirmBtn} onClick={handleConfirmCounter}>Confirmar</button>
        <button style={bn.cancelInputBtn} onClick={() => { setShowInput(false); setCounterVal('') }}>✕</button>
      </div>
    )
  }

  return (
    <div style={bn.active}>
      <p style={bn.proposalText}>Proposta: R$ {fmtBRL(latest.amount)}</p>
      <div style={bn.actions}>
        <button style={bn.acceptBtn} onClick={onAccept}>Aceitar</button>
        <button style={bn.counterBtn} onClick={() => setShowInput(true)}>Contra-proposta</button>
        {!isWorkerView && (
          <button style={bn.cancelBtn} onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </div>
  )
}

const bn = {
  active: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px',
  },
  proposalText: { fontSize: 13, fontWeight: '600', color: '#252525', margin: '0 0 8px' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  acceptBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  counterBtn: {
    background: 'none', color: '#38b31f', border: '1px solid #38b31f', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  cancelBtn: {
    background: 'none', color: '#e53935', border: '1px solid #e53935', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  waiting: {
    background: '#f8f8f8', borderBottom: '1px solid rgba(60,60,60,0.1)',
    padding: '10px 20px',
  },
  waitingText: { fontSize: 12, color: '#888', margin: 0 },
  accepted: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  acceptedText: { fontSize: 13, fontWeight: '600', color: '#38b31f', margin: 0 },
  payBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 16px', fontSize: 13, fontWeight: '700', cursor: 'pointer',
  },
  waitingPay: { fontSize: 11, color: '#888', margin: 0 },
  cancelled: {
    background: '#fafafa', borderBottom: '1px solid rgba(60,60,60,0.1)',
    padding: '10px 20px',
  },
  cancelledText: { fontSize: 12, color: '#aaa', margin: 0 },
  inputBanner: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8,
  },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#252525' },
  inputRow: {
    display: 'flex', alignItems: 'center',
    border: '1px solid rgba(56,179,31,0.5)', borderRadius: 8,
    overflow: 'hidden', background: '#fff',
  },
  inputCurrency: { padding: '6px 8px', fontSize: 13, fontWeight: '600', color: '#38b31f', background: '#f4faf2' },
  inputField: {
    border: 'none', padding: '6px 8px', fontSize: 15, fontWeight: '700',
    color: '#252525', outline: 'none', width: 90, background: 'transparent',
  },
  confirmBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  cancelInputBtn: {
    background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer', padding: 4,
  },
}

export default function ChatPage() {
  const { state } = useLocation()
  const { worker, client, isWorkerView } = state || {}
  const [hire, setHire] = useState(state?.hire || null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [proposals, setProposals] = useState([])
  const [text, setText] = useState('')
  const [pendingImg, setPendingImg] = useState(null)
  const bottomRef = useRef()
  const fileRef = useRef()

  useEffect(() => { if (hire?.id) loadAll() }, [hire?.id])

  useEffect(() => {
    if (!hire?.id) return
    const interval = setInterval(loadAll, 3000)
    return () => clearInterval(interval)
  }, [hire?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadAll = async () => {
    if (!hire?.id) return
    await Promise.all([loadMessages(), loadProposals()])
  }

  const loadMessages = async () => {
    const saved = hire ? readLocal(hire.id) : []
    const savedImgs = saved.filter(m => m.img)
    try {
      const { data } = await messageApi.list(hire.id, user.id)
      const api = data.data?.messages || []
      const apiIds = new Set(api.map(m => m.id))
      const extraImgs = savedImgs.filter(m => !apiIds.has(m.id))
      setMessages([...api, ...extraImgs])
    } catch {
      setMessages(saved)
    }
  }

  const loadProposals = async () => {
    try {
      const { data } = await hireApi.getProposals(hire.id)
      setProposals(data.data?.proposals || [])
    } catch {}
  }

  const handleAttach = () => fileRef.current?.click()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPendingImg(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const send = async (e) => {
    e.preventDefault()
    if (!hire) return

    if (pendingImg) {
      const msg = { id: `tmp-img-${Date.now()}`, senderId: user.id, img: pendingImg, createdAt: new Date().toISOString() }
      setMessages(prev => {
        const next = [...prev, msg]
        saveLocal(hire.id, next)
        return next
      })
      setPendingImg(null)
    }

    if (text.trim()) {
      const content = text.trim()
      setText('')
      const msg = { id: `tmp-${Date.now()}`, senderId: user.id, content, createdAt: new Date().toISOString() }
      setMessages(prev => {
        const next = [...prev, msg]
        saveLocal(hire.id, next)
        return next
      })
      try {
        await messageApi.send(hire.id, { senderId: user.id, content })
        await loadMessages()
      } catch (err) {
        const msg = err?.response?.data?.error
        toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar mensagem')
      }
    }
  }

  const handleAccept = async () => {
    const latest = proposals[proposals.length - 1]
    if (!latest) return
    if (hire?.status === 'accepted') {
      navigate('/payment', { state: { hire, worker, agreedAmount: latest.amount } })
      return
    }
    try {
      const { data } = await hireApi.acceptProposal(hire.id, { acceptorId: user.id })
      setHire(prev => ({ ...prev, status: 'accepted' }))
      const agreedAmount = data.data?.agreedAmount ?? latest.amount
      if (!isWorkerView) {
        navigate('/payment', { state: { hire: { ...hire, status: 'accepted' }, worker, agreedAmount } })
      }
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao aceitar proposta')
    }
  }

  const handleCounter = async (amount) => {
    try {
      await hireApi.submitProposal(hire.id, { authorId: user.id, amount })
      await loadProposals()
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar contra-proposta')
    }
  }

  const handleCancel = async () => {
    try {
      await hireApi.updateStatus(hire.id, 'cancelled')
      setHire(prev => ({ ...prev, status: 'cancelled' }))
    } catch {}
  }

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <WorkerAvatar />
        <div style={s.workerInfo}>
          {isWorkerView ? (
            <>
              <p style={s.wName}>{client?.name || 'Cliente'}</p>
              <p style={s.wType}>Solicitante</p>
            </>
          ) : (
            <>
              <p style={s.wName}>{worker?.name || 'Profissional'}</p>
              <p style={s.wType}>{worker?.serviceTypes?.[0] || 'Profissional'}</p>
            </>
          )}
        </div>
      </div>

      <NegotiationBanner
        hire={hire}
        proposals={proposals}
        isWorkerView={isWorkerView}
        user={user}
        onAccept={handleAccept}
        onCounter={handleCounter}
        onCancel={handleCancel}
      />

      <div style={s.messages}>
        <p style={s.dateSep}>{today}</p>

        <div style={s.notice}>
          <p style={s.noticeTitle}>Mensagem automática</p>
          <p style={s.noticeBody}>
            Não compartilhe dados pessoais ou bancários. Use o chat apenas para assuntos do serviço, com respeito e dentro das diretrizes da empresa.
          </p>
        </div>

        {messages.map(m => {
          const isMe = m.senderId === user.id
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              {m.img ? (
                <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem), padding: 4 }}>
                  <img src={m.img} style={{ maxWidth: 200, maxHeight: 200, borderRadius: 10, display: 'block' }} alt="" />
                </div>
              ) : (
                <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                  <p style={{ color: isMe ? '#fff' : '#1a1a1a', fontSize: 12, margin: 0 }}>{m.content}</p>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {pendingImg && (
        <div style={s.pendingWrap}>
          <img src={pendingImg} style={s.pendingImg} alt="" />
          <span style={s.pendingLabel}>Pronto para enviar</span>
          <button style={s.removePending} onClick={() => setPendingImg(null)}>✕</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" style={{ display: 'none' }} onChange={handleFile} />

      <form style={s.inputRow} onSubmit={send}>
        <button type="button" style={s.attachBtn} onClick={handleAttach} title="Anexar arquivo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3c3c3c" style={{ transform: 'rotate(-45deg)' }}>
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
        <input
          style={s.input}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button style={s.sendBtn} type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#fbfbfb' },
  header: {
    display: 'flex', alignItems: 'center', padding: '44px 20px 12px',
    borderBottom: '1px solid rgba(60,60,60,0.15)', gap: 8, background: '#fbfbfb', flexShrink: 0,
  },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  workerInfo: { flex: 1, minWidth: 0 },
  wName: { fontWeight: '600', fontSize: 12, color: '#000', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  wType: { fontSize: 11, color: '#3c3c3c', lineHeight: 1.3, margin: 0 },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' },
  dateSep: { textAlign: 'center', fontSize: 11, color: '#3c3c3c', marginBottom: 14 },
  notice: { border: '1px solid rgba(60,60,60,0.4)', borderRadius: 8, padding: '12px 12px', marginBottom: 16, textAlign: 'center' },
  noticeTitle: { fontSize: 9, color: '#252525', fontWeight: '700', margin: '0 0 6px' },
  noticeBody: { fontSize: 11, color: '#444', lineHeight: 1.5, margin: 0 },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: 16 },
  bubbleMe: { background: '#38b31f' },
  bubbleThem: { background: '#f0f0f0' },
  pendingWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', background: '#f0fff0', borderTop: '1px solid rgba(56,179,31,0.3)', flexShrink: 0 },
  pendingImg: { width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(56,179,31,0.4)' },
  pendingLabel: { flex: 1, fontSize: 11, color: '#38b31f', fontWeight: '600' },
  removePending: { background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 10, width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 },
  inputRow: { display: 'flex', alignItems: 'center', padding: '10px 16px 16px', gap: 8, background: '#fbfbfb', borderTop: '1px solid rgba(60,60,60,0.1)', flexShrink: 0 },
  attachBtn: { background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
  input: { flex: 1, border: '1px solid rgba(60,60,60,0.4)', borderRadius: 22, padding: '9px 16px', fontSize: 13, background: '#fff', color: '#252525', outline: 'none' },
  sendBtn: { background: '#38b31f', border: 'none', borderRadius: 24, padding: '9px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
}
```

- [ ] **Step 2: Verify the chat banner renders correctly**

Start dev server, log in as a client, navigate to a worker profile → Solicitar Orçamento → fill form → confirm. The chat should open with a "Aguardando resposta" banner. Log in as worker and verify "Aceitar / Contra-proposta" buttons appear.

- [ ] **Step 3: Commit**

```bash
cd front-end && git add src/pages/hire/ChatPage.jsx
git commit -m "feat: replace static accept/refuse buttons with dynamic NegotiationBanner in ChatPage"
```

---

### Task 9: Frontend — WorkerHiresPage + PaymentPage

**Files:**
- Modify: `front-end/src/pages/hire/WorkerHiresPage.jsx`
- Modify: `front-end/src/pages/hire/PaymentPage.jsx`

**Interfaces:**
- Consumes: `latestProposalAmount` from `hireApi.list` response (Task 7), `agreedAmount` from `navigate` state (Task 8)

- [ ] **Step 1: Update WorkerHiresPage to show proposal amount**

In `front-end/src/pages/hire/WorkerHiresPage.jsx`, update the hire card to display the proposal amount. Find the `<div style={s.row}>` block that renders the description and badge, and add the amount:

```jsx
<div style={s.row}>
  <p style={s.desc}>{hire.description || 'Solicitação de orçamento'}</p>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
    {hire.latestProposalAmount != null && (
      <span style={s.amount}>
        R$ {Number(hire.latestProposalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    )}
    <span style={{ ...s.badge, background: STATUS_COLOR[hire.status] || '#aaa' }}>
      {STATUS_LABEL[hire.status] || hire.status}
    </span>
  </div>
</div>
```

Add to the `s` styles object:

```jsx
amount: { fontSize: 11, fontWeight: '700', color: '#252525' },
```

- [ ] **Step 2: Update PaymentPage to use real agreed amount from navigate state**

In `front-end/src/pages/hire/PaymentPage.jsx`:

1. Change the destructuring at the top of the component:
```jsx
const { hire, worker, agreedAmount } = state || {}
const displayAmount = agreedAmount ?? 75.99
```

2. Replace all occurrences of `75.99` with `displayAmount` and format them:
```jsx
// Summary rows:
<div style={s.summaryRow}><span>Subtotal</span><span>R$ {Number(displayAmount - 5.99).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
<div style={s.summaryRow}><span>Taxa de serviço</span><span>R$ 5,99</span></div>
<div style={s.totalRow}>
  <span style={s.totalLabel}>Total a pagar</span>
  <span style={s.totalLabel}>R$ {Number(displayAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
</div>
```

3. Update `handlePay` to use `displayAmount`:
```jsx
try { await paymentApi.process(hire?.id, displayAmount) } catch {}
```

4. Update the pay button label:
```jsx
{loading ? 'Processando...' : `Confirmar pagamento · R$ ${Number(displayAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
```

- [ ] **Step 3: Verify PaymentPage shows correct amount**

In dev, complete a negotiation flow (propose R$200, accept, click Pagar). PaymentPage should show R$200,00 as the total, not R$75,99.

- [ ] **Step 4: Commit**

```bash
cd front-end && git add src/pages/hire/WorkerHiresPage.jsx src/pages/hire/PaymentPage.jsx
git commit -m "feat: show proposal amount in WorkerHiresPage, use real agreedAmount in PaymentPage"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `proposal` table with correct columns — Task 2
- [x] `hire` drops `pending`, gains `negotiating` — Task 1
- [x] `CreateHireUsecase` creates hire + proposal atomically — Task 3
- [x] `SubmitProposalUsecase` validates turn and round sequence — Task 3
- [x] `AcceptProposalUsecase` validates turn, transitions hire to `accepted` — Task 4
- [x] `GetHireProposalsUsecase` returns ordered proposals — Task 4
- [x] `UpdateHireStatusUsecase` keeps only `cancelled`/`completed` — Task 3
- [x] `ListHiresOutputDto` includes `latestProposalAmount` + `latestProposalAuthorId` — Task 5
- [x] Error 409 for NotYourTurn, 422 for HireNotNegotiating — Task 3
- [x] Three new API controllers auto-loaded — Task 6
- [x] `HireRequestPage` with description + price fields — Task 7
- [x] `WorkerProfilePage` navigates to `/hire-request` — Task 7
- [x] `ChatPage` dynamic `NegotiationBanner` with accept/counter/cancel — Task 8
- [x] Proposals polled every 3s — Task 8
- [x] `WorkerHiresPage` shows proposal amount — Task 9
- [x] `PaymentPage` uses real `agreedAmount` — Task 9
- [x] Integration tests updated to new flow — Task 5
