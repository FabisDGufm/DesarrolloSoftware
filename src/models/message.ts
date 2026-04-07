export interface DirectMessage {
    id: string;
    fromUserId: number;
    toUserId: number;
    text: string;
    createdAt: Date;
}
