export interface ListHiresOutputDto {
    hires: {
        id: string
        clientId: string
        clientName: string
        clientPhotoUrl: string | null
        workerId: string
        workerName: string
        workerPhotoUrl: string | null
        serviceTypeId: string
        description: string
        status: string
        createdAt: Date
        latestProposalAmount: number | null
        latestProposalAuthorId: string | null
    }[]
}
