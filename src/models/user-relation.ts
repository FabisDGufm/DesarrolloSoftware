export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRelation {
    id: number;
    requesterId: number;
    receiverId: number;
    status: FriendRequestStatus;
    createdAt: Date;
}
