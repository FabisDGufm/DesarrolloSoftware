export interface Announcement {
    university: string;
    announcementId: string;
    title: string;
    text: string;
    imageUrl?: string | null;
    eventDate?: string;
    createdAt: string;
    createdBy: number;
}