import type BaseUsecase from '@application/use-cases/base.usecase';
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found';
import { HireNotAccepted } from '@application/use-cases/hire/_errors/hire-not-accepted';
import { HireAlreadyPaid } from '@application/use-cases/payment/_errors/hire-already-paid';
import { PaymentEntity } from '@domain/entities/payment.entity';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import type { IPaymentRepository } from '@domain/repositories/payment.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { ProcessPaymentInputDto } from './process-payment.input.dto';
import type { ProcessPaymentOutputDto } from './process-payment.output.dto';

@injectable()
export class ProcessPaymentUsecase implements BaseUsecase<ProcessPaymentInputDto, ProcessPaymentOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PAYMENT)
        private readonly paymentRepository: IPaymentRepository,
    ) {}

    async execute({ hireId, amount }: ProcessPaymentInputDto): Promise<ProcessPaymentOutputDto> {
        const hire = await this.hireRepository.findById(hireId);
        if (!hire) throw new HireNotFound();
        if (hire.props.status !== 'accepted') throw new HireNotAccepted();

        const existing = await this.paymentRepository.findByHireId(hireId);
        if (existing) throw new HireAlreadyPaid();

        const paymentEntity = PaymentEntity.create({ hireId, amount });
        paymentEntity.pay();
        await this.paymentRepository.create(paymentEntity);

        hire.complete();
        await this.hireRepository.save(hire);

        return {
            id: paymentEntity.props.id,
            hireId: paymentEntity.props.hireId,
            amount: paymentEntity.props.amount,
            status: paymentEntity.props.status,
            paidAt: paymentEntity.props.paidAt,
        };
    }
}
