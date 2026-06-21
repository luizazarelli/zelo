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
