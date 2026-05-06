export interface Post {
    authorId: number;
    postId: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;

    
    type?: "normal" | "news" | "announcement";
    university?: string | null;
}