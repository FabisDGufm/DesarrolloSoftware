export interface Promotion {
    id: string;
    userId: number;
    title: string;
    description: string;
    price?: number;
    contact: string;
    imageUrl?: string | null;
    university: string;
    createdAt: string;
}