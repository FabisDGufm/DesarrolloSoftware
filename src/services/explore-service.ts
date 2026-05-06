// Servicio de Explore (listado + búsqueda)

import type { ExploreResult } from '../models/explore.js';
import type { ExploreRepository } from '../repositories/explore-repository.js';
import { ValidationError } from '../utils/custom-errors.js';

const EXPLORE_TYPES = ['user', 'post', 'topic'] as const;
export type ExploreEntityType = (typeof EXPLORE_TYPES)[number];

export class ExploreService {
    constructor(private readonly repo: ExploreRepository) {}

    /** Sin `q` (o vacío): destacados. Con texto: búsqueda case-insensitive en título/snippet. */
    async search(query: string): Promise<ExploreResult[]> {
        const q = query.trim();
        if (q.length === 0) {
            return this.repo.listFeatured(50);
        }
        return this.repo.search(q);
    }

    /** Listar por tipo (`user` | `post` | `topic`), opcionalmente filtrado por `q`. */
    async browseByType(
        typeRaw: string,
        query?: string
    ): Promise<ExploreResult[]> {
        const t = typeRaw.toLowerCase();
        if (!EXPLORE_TYPES.includes(t as ExploreEntityType)) {
            throw new ValidationError(
                `type must be one of: ${EXPLORE_TYPES.join(', ')}`
            );
        }
        const type = t as ExploreEntityType;
        const q = query?.trim();
        return this.repo.searchByType(type, q && q.length > 0 ? q : undefined);
    }
}
