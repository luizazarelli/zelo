export interface ListPreviousHiresOutputDto {
    hires: {
        id: string;
        clientId: string;
        workerId: string;
        serviceTypeId: string;
        description: string;
        createdAt: Date;
    }[];
}
