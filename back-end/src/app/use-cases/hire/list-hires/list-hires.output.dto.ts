export interface ListHiresOutputDto {
    hires: {
        id: string;
        clientId: string;
        workerId: string;
        serviceTypeId: string;
        description: string;
        status: string;
        createdAt: Date;
    }[];
}
