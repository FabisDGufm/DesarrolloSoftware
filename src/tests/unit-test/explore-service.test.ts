import { ExploreService } from '../../services/explore-service.js';
import { ExploreRepository } from '../../repositories/explore-repository.js';

describe('ExploreService', () => {
    let exploreService: ExploreService;

    beforeEach(() => {
        const repo = new ExploreRepository();
        exploreService = new ExploreService(repo);
    });

    describe('search', () => {
        it('should return all results when query is empty', async () => {
            const results = await exploreService.search('');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0]).toHaveProperty('id');
            expect(results[0]).toHaveProperty('type');
            expect(results[0]).toHaveProperty('title');
            expect(results[0]).toHaveProperty('snippet');
        });

        it('should return matching results for a valid query', async () => {
            const results = await exploreService.search('Alice');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(1);
            expect(results.some(r => r.title.toLowerCase().includes('alice'))).toBe(true);
        });

        it('should return empty array when no match', async () => {
            const results = await exploreService.search('xyznonexistent123');
            expect(results).toEqual([]);
        });

        it('should filter by type when query matches type', async () => {
            const results = await exploreService.search('user');
            expect(results.length).toBeGreaterThanOrEqual(1);
            expect(results.every(r => r.type === 'user' || r.title.toLowerCase().includes('user') || r.snippet.toLowerCase().includes('user'))).toBe(true);
        });
    });
});
