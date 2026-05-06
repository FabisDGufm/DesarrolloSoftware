import { ExploreService } from '../../services/explore-service.js';
import type { ExploreRepository } from '../../repositories/explore-repository.js';

describe('ExploreService browse + search routing', () => {
    let repo: jest.Mocked<
        Pick<ExploreRepository, 'listFeatured' | 'search' | 'searchByType'>
    >;
    let service: ExploreService;

    beforeEach(() => {
        repo = {
            listFeatured: jest.fn(),
            search: jest.fn(),
            searchByType: jest.fn(),
        };
        service = new ExploreService(repo as unknown as ExploreRepository);
    });

    it('search with empty string calls listFeatured', async () => {
        repo.listFeatured.mockResolvedValue([
            {
                id: 1,
                type: 'post',
                title: 'T',
                snippet: 'S',
            },
        ]);
        const r = await service.search('   ');
        expect(repo.listFeatured).toHaveBeenCalledWith(50);
        expect(repo.search).not.toHaveBeenCalled();
        expect(r).toHaveLength(1);
    });

    it('search with text calls repo.search', async () => {
        repo.search.mockResolvedValue([]);
        await service.search('hello');
        expect(repo.search).toHaveBeenCalledWith('hello');
        expect(repo.listFeatured).not.toHaveBeenCalled();
    });

    it('browseByType rejects invalid type', async () => {
        await expect(service.browseByType('invalid')).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it('browseByType calls searchByType', async () => {
        repo.searchByType.mockResolvedValue([]);
        await service.browseByType('user', 'a');
        expect(repo.searchByType).toHaveBeenCalledWith('user', 'a');
    });
});
