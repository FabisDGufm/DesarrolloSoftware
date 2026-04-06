// Modelo para resultados de búsqueda (Explore)

export interface ExploreResult {
    id: number;
    type: 'user' | 'post' | 'topic';
    title: string;
    snippet: string;
}
