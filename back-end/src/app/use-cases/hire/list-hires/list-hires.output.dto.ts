export interface ListHiresOutputDto {
    hires: {
        id: string
        clientId: string
        clientName: string
        workerId: string
        workerName: string
        serviceTypeId: string
        description: string
        status: string
        createdAt: Date
        latestProposalAmount: number | null
        latestProposalAuthorId: string | null
    }[]
}
