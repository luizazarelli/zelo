import type BaseUsecase from '@application/use-cases/base.usecase';
import { PaymentNotFound } from '@application/use-cases/payment/_errors/payment-not-found';
import type { IPaymentRepository } from '@domain/repositories/payment.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { GetPaymentInputDto } from './get-payment.input.dto';
import type { GetPaymentOutputDto } from './get-payment.output.dto';

@injectable()
export class GetPaymentUsecase implements BaseUsecase<GetPaymentInputDto, GetPaymentOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.PAYMENT)
        private readonly paymentRepository: IPaymentRepository,
    ) {}

    async execute({ hireId }: GetPaymentInputDto): Promise<GetPaymentOutputDto> {
        const pay = await this.paymentRepository.findByHireId(hireId);
        if (!pay) throw new PaymentNotFound();

        return {
            id: pay.props.id,
            hireId: pay.props.hireId,
            amount: pay.props.amount,
            status: pay.props.status,
            createdAt: pay.props.createdAt,
            paidAt: pay.props.paidAt,
        };
    }
}
