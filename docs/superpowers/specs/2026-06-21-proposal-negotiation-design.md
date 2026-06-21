# Proposal Negotiation — Design Spec

**Date:** 2026-06-21
**Status:** Approved

## Overview

Introduce a proposal/counter-proposal negotiation flow between client and worker before a hire is accepted. The client submits an initial price when requesting a service; the worker can accept or counter-propose; either party can keep counter-proposing until one side accepts or the hire is cancelled. There is no round limit.

---

## 1. Data Model

### New table: `proposal`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `hire_id` | uuid FK → hire | Cascade delete |
| `author_id` | uuid FK → users | Who submitted this proposal |
| `amount` | numeric(10,2) | Proposed value in BRL |
| `round` | integer | Sequence: 1, 2, 3… monotonically increasing |
| `created_at` | timestamp | |

Proposals are immutable after creation. The active proposal is always the one with the highest `round`. No status field on proposal itself.

### Changes to `hire`

- Status `pending` is replaced by `negotiating` as the initial state.
- `pending` is removed from the system entirely.
- Hire `description` is now set from the client's hire request form (replaces the hardcoded "Solicitação de orçamento via app").

**Valid hire status transitions:**
```
negotiating → accepted   (either party accepts the latest proposal)
negotiating → cancelled  (either party cancels)
accepted    → completed  (after payment)
```

**Turn rule:** The party who did NOT author the latest proposal has the next turn.  
- `latestProposal.authorId === clientId` → worker's turn  
- `latestProposal.authorId === workerId` → client's turn

---

## 2. Backend Architecture

### Domain

**New: `domain/entities/proposal.entity.ts`**
- Props: `id`, `hireId`, `authorId`, `amount`, `round`, `createdAt`
- Static `create(props)` and `restore(props)` constructors
- No state-mutation methods (proposals are immutable)

**New: `domain/repositories/proposal.repository.ts`**
```typescript
interface IProposalRepository {
  create(proposal: ProposalEntity): Promise<void>
  listByHireId(hireId: string): Promise<ProposalEntity[]>
  findLatestByHireId(hireId: string): Promise<ProposalEntity | null>
}
```

### Use Cases

**Updated: `CreateHireUsecase`**
- Receives `amount` (number) and `description` (string) in addition to current fields
- Creates hire with status `negotiating`
- Creates proposal (round 1, authorId = clientId, amount) in the same operation
- Returns hire id, status, and the initial proposal amount

**New: `SubmitProposalUsecase`**
- Input: `hireId`, `authorId`, `amount`
- Validates hire is in `negotiating` status
- Validates it is the caller's turn (latest proposal was authored by the other party)
- Creates new proposal with `round = latestRound + 1`
- Returns new proposal data

**New: `AcceptProposalUsecase`**
- Input: `hireId`, `acceptorId`
- Validates hire is in `negotiating` status
- Validates it is the caller's turn (they are not the author of the latest proposal)
- Sets hire status to `accepted`
- Returns the agreed amount (from the latest proposal)

**Updated: `UpdateHireStatusUsecase`**
- Keeps only `cancelled` as a valid action (removes `accepted` handling, which now belongs to `AcceptProposalUsecase`)

**New: `GetHireProposalsUsecase`**
- Input: `hireId`
- Returns all proposals for a hire ordered by round ascending

### API Endpoints

| Method | Path | Use case | Description |
|---|---|---|---|
| `POST` | `/hires` | `CreateHireUsecase` | Create hire + initial proposal |
| `POST` | `/hires/:hireId/proposals` | `SubmitProposalUsecase` | Submit counter-proposal |
| `PATCH` | `/hires/:hireId/proposals/accept` | `AcceptProposalUsecase` | Accept latest proposal |
| `PATCH` | `/hires/:hireId/status` | `UpdateHireStatusUsecase` | Cancel hire |
| `GET` | `/hires/:hireId/proposals` | `GetHireProposalsUsecase` | List all proposals |

### DTO changes

**`CreateHireInputDto`** gains: `amount: number`

**`ListHiresOutputDto`** each hire item gains:
- `latestProposalAmount: number`
- `latestProposalAuthorId: string`

These are resolved inside `ListHiresUsecase` by calling `proposalRepository.findLatestByHireId` for each hire.

### Infrastructure

- New: `infra/persistence/schema.ts` — add `proposal` table definition
- New: `infra/persistence/mappers/proposal.mapper.ts`
- New: `infra/persistence/repositories/proposal.repository.ts`
- New: Drizzle migration for the `proposal` table
- Register `IProposalRepository` token in `infra/tokens.ts` and DI container

---

## 3. Frontend

### New page: `HireRequestPage` (`/hire-request`)

Replaces the direct `hireApi.create()` call in `WorkerProfilePage.handleHire`.

**Fields:**
- Descrição do serviço (textarea, required)
- Valor proposto (numeric input, R$, required)
- "Enviar solicitação" button

**On submit:**
- Calls `hireApi.create({ clientId, workerId, serviceTypeId, description, amount })`
- On success: navigates to `/chat` with `{ worker, hire, isWorkerView: false }`

**Navigation into this page:**
- `WorkerProfilePage` navigates to `/hire-request` with `{ worker }` in state instead of calling the API directly

### `ChatPage` — negotiation banner

Replaces the current header action buttons (Aceitar/Recusar/Pagar/Aguardando).

A banner is rendered between the chat header and the messages area. Banner content is determined by `hire.status`, the latest proposal, and `isWorkerView`:

**When `hire.status === 'negotiating'`:**

_It's my turn (latest proposal was authored by the other party):_
```
┌─────────────────────────────────────────────────┐
│ Proposta: R$ X,XX                               │
│ [Aceitar]  [Contra-proposta ▼]  [Cancelar*]     │
└─────────────────────────────────────────────────┘
* Cancelar only shown to client
```
Clicking "Contra-proposta" expands an inline input within the banner:
```
┌─────────────────────────────────────────────────┐
│ Seu valor: [R$ _______]  [Confirmar]  [✕]      │
└─────────────────────────────────────────────────┘
```

_It's the other party's turn (latest proposal is mine):_
```
┌─────────────────────────────────────────────────┐
│ Aguardando resposta — sua proposta: R$ X,XX     │
└─────────────────────────────────────────────────┘
```

**When `hire.status === 'accepted'`:**
- Client sees: "Proposta aceita — R$ X,XX" + **Pagar** button (navigates to `/payment` with agreed amount)
- Worker sees: "Proposta aceita — R$ X,XX. Aguardando pagamento."

**When `hire.status === 'cancelled'`:**
- Both see: "Contratação cancelada"

**Data loading:**
- `ChatPage` calls `GET /hires/:hireId/proposals` on mount and every 3 seconds (alongside the existing message polling)
- Derives banner state from latest proposal + hire status

### `WorkerHiresPage`

- Each hire card displays the latest proposal amount next to the status badge: `R$ X,XX`
- The `hireApi.list` response already includes `latestProposalAmount` from the updated DTO

### `PaymentPage`

- Removes hardcoded `R$ 75,99`
- Reads agreed amount from `navigate` state: `state.agreedAmount`
- `agreedAmount` is NOT a backend field — it is set by `ChatPage` when navigating to `/payment`:
  `navigate('/payment', { state: { hire, worker, agreedAmount: latestProposal.amount } })`
- Displays and submits this real amount to `paymentApi.process`

### API client (`api.js`)

New calls to add to `hireApi`:
```javascript
submitProposal: (hireId, { authorId, amount }) => api.post(`/hires/${hireId}/proposals`, { authorId, amount })
acceptProposal: (hireId, { acceptorId }) => api.patch(`/hires/${hireId}/proposals/accept`, { acceptorId })
getProposals:   (hireId) => api.get(`/hires/${hireId}/proposals`)
```

---

## 4. Error Handling

| Scenario | Response |
|---|---|
| Submitting proposal when it's not your turn | 409 Conflict — "Não é sua vez de propor" |
| Accepting proposal when it's not your turn | 409 Conflict — "Não é sua vez de aceitar" |
| Hire is not in `negotiating` status | 422 Unprocessable — "Contratação não está em negociação" |
| Amount ≤ 0 | 400 Bad Request |

---

## 5. Out of Scope

- Push notifications for new proposals
- Proposal expiry / timeout
- Rating system (button exists in UI but is a known stub)
- Payment method changes (still Pix / credit / debit, same flow)
