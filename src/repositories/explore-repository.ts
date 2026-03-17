// Repositorio simulado de Explore (búsqueda)

import type { ExploreResult } from '../models/explore.js';

const simulateDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

const mockExploreData: ExploreResult[] = [
    { id: 1, type: 'user', title: 'Alice', snippet: 'Usuario de ejemplo.' },
    { id: 2, type: 'user', title: 'Bob', snippet: 'Otro usuario.' },
    { id: 3, type: 'post', title: 'Hello World', snippet: 'Primera publicación.' },
    { id: 4, type: 'post', title: 'Explore feature', snippet: 'Búsqueda simulada.' },
    { id: 5, type: 'topic', title: 'typescript', snippet: 'Tema sobre TypeScript.' },
];

export class ExploreRepository {

    async search(query: string): Promise<ExploreResult[]> {
        await simulateDelay();
        const q = query.toLowerCase().trim();
        if (!q) return [...mockExploreData];
        const results = mockExploreData.filter(
            r =>
                r.title.toLowerCase().includes(q) ||
                r.snippet.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q)
        );
        console.log(`[DB] EXPLORE search: "${query}" -> ${results.length} results`);
        return results;
    }
}
