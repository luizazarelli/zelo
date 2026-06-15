export interface ListMessagesOutputDto {
    messages: {
        id: string;
        senderId: string;
        content: string;
        createdAt: Date;
    }[];
}
