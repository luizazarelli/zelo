export interface GetPaymentOutputDto {
    id: string;
    hireId: string;
    amount: number;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
}
