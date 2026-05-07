export interface Announcement {
    authorId: number;
    announcementId: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;
    university?: string | null;
}