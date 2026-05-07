export interface Promotion {
    promotionId: string;
    userId: number;
    title: string;
    description: string;
    price?: number | null;
    contact: string;
    imageUrl?: string | null;
    university?: string | null;
    createdAt: string;
}