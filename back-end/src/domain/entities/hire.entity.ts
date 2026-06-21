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
