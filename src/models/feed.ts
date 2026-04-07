// Modelo del feed principal (simulado)

export interface FeedItem {
    id: number;
    authorId: number;
    content: string;
    createdAt: Date;
}

export interface CreateFeedItem {
    authorId: number;
    content: string;
}

export interface UpdateFeedItem {
    content: string;
}