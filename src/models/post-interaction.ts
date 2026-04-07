export interface PostComment {
    id: string;
    userId: number;
    text: string;
    createdAt: Date;
    /** Present when the comment was edited after creation. */
    updatedAt?: Date;
}

export interface PostLikeSummary {
    userIds: number[];
    count: number;
    likedByMe: boolean;
}
