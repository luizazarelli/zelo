export interface ProcessPaymentOutputDto {
    id: string;
    hireId: string;
    amount: number;
    status: string;
    paidAt: Date | null;
}
