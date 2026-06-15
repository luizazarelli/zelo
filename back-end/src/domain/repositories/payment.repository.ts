import type { PaymentEntity } from '@domain/entities/payment.entity';

export interface IPaymentRepository {
    create(payment: PaymentEntity): Promise<void>;
    save(payment: PaymentEntity): Promise<void>;
    findById(id: string): Promise<PaymentEntity | null>;
    findByHireId(hireId: string): Promise<PaymentEntity | null>;
}
