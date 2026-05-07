export interface Post {
    authorId: number;
    postId: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;

    
    type?: "normal" | "news" | "announcement";
    university?: string | null;

    /** Perfil: contenido republicado por este usuario (metadata de UI). */
    isRepost?: boolean;
    /** ISO de cuando este usuario republicó (orden en perfil). */
    repostedAt?: string;
}