export interface GetHireProposalsOutputDto {
    proposals: {
        id: string
        hireId: string
        authorId: string
        amount: number
        round: number
        createdAt: Date
    }[]
}
