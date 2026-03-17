// Servicio de Explore (búsqueda)

import type { ExploreResult } from '../models/explore.js';
import type { ExploreRepository } from '../repositories/explore-repository.js';

export class ExploreService {
    constructor(private readonly repo: ExploreRepository) {}

    async search(query: string): Promise<ExploreResult[]> {
        return this.repo.search(query);
    }
}
