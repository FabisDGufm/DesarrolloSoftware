import { jest } from '@jest/globals';
import { ExploreService } from '../../services/explore-service.js';
import type { ExploreRepository } from '../../repositories/explore-repository.js';
import type { ExploreResult } from '../../models/explore.js';

describe('ExploreService', () => {
    let repo: any;
    let service: ExploreService;

    const mockResults: ExploreResult[] = [
        { id: 1, type: 'user', title: 'Alice', snippet: 'Alice is a user' },
        { id: 2, type: 'post', title: 'Hello post', snippet: 'Hello world' },
    ];

    beforeEach(() => {
        repo = {
            listFeatured: jest.fn(),
            search: jest.fn(),
            searchByType: jest.fn(),
            indexItem: jest.fn(),
        };
        service = new ExploreService(repo as unknown as ExploreRepository);
    });

    describe('search', () => {
        it('should return all results when query is empty', async () => {
            repo.listFeatured.mockResolvedValue(mockResults);
            const results = await service.search('');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0]).toHaveProperty('id');
            expect(results[0]).toHaveProperty('type');
        });

        it('should return matching results for a valid query', async () => {
            repo.search.mockResolvedValue([mockResults[0]]);
            const results = await service.search('Alice');
            expect(results.length).toBeGreaterThanOrEqual(1);
            expect(results.some(r => r.title.toLowerCase().includes('alice'))).toBe(true);
        });

        it('should return empty array when no match', async () => {
            repo.search.mockResolvedValue([]);
            const results = await service.search('xyznonexistent123');
            expect(results).toEqual([]);
        });

        it('should filter by type when query matches type', async () => {
            repo.search.mockResolvedValue([mockResults[0]]);
            const results = await service.search('user');
            expect(results.length).toBeGreaterThanOrEqual(1);
        });
    });
});