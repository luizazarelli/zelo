import { randomUUID } from 'node:crypto';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

interface IPaymentEntityProps {
    id: string;
    hireId: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    paidAt: Date | null;
}

type CreatePaymentProps = Omit<IPaymentEntityProps, 'id' | 'status' | 'createdAt' | 'paidAt'>;

export class PaymentEntity {
    private constructor(private _props: IPaymentEntityProps) {}

    static create(props: CreatePaymentProps): PaymentEntity {
        return new PaymentEntity({
            id: randomUUID(),
            status: 'pending',
            createdAt: new Date(),
            paidAt: null,
            ...props,
        });
    }

    static restore(props: IPaymentEntityProps): PaymentEntity {
        return new PaymentEntity(props);
    }

    pay(): void {
        this._props.status = 'paid';
        this._props.paidAt = new Date();
    }

    fail(): void {
        this._props.status = 'failed';
    }

    get props(): Readonly<IPaymentEntityProps> {
        return this._props;
    }
}
