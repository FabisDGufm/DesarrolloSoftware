import { PostInteractionService } from '../../services/post-interaction-service.js';
import type { PostInteractionRepository } from '../../repositories/post-interaction-repository.js';

describe('PostInteractionService', () => {
    const createdAt = '2025-01-01T12:00:00.000Z';
    let repo: jest.Mocked<
        Pick<
            PostInteractionRepository,
            | 'putLike'
            | 'deleteLike'
            | 'listLikes'
            | 'getLike'
            | 'addComment'
            | 'listComments'
            | 'getComment'
            | 'updateCommentText'
            | 'deleteComment'
            | 'recordShare'
            | 'countShares'
            | 'putSave'
            | 'deleteSave'
            | 'listSaves'
            | 'getSave'
            | 'recordRepost'
            | 'countReposts'
        >
    >;
    let service: PostInteractionService;

    beforeEach(() => {
        repo = {
            putLike: jest.fn(),
            deleteLike: jest.fn(),
            listLikes: jest.fn(),
            getLike: jest.fn(),
            addComment: jest.fn(),
            listComments: jest.fn(),
            getComment: jest.fn(),
            updateCommentText: jest.fn(),
            deleteComment: jest.fn(),
            recordShare: jest.fn(),
            countShares: jest.fn(),
            putSave: jest.fn(),
            deleteSave: jest.fn(),
            listSaves: jest.fn(),
            getSave: jest.fn(),
            recordRepost: jest.fn(),
            countReposts: jest.fn(),
        };
        service = new PostInteractionService(repo as unknown as PostInteractionRepository);
    });

    it('like calls repository', async () => {
        repo.putLike.mockResolvedValue(undefined);
        await service.like(5, '1', '10', { createdAt });
        expect(repo.putLike).toHaveBeenCalledWith(
            1,
            10,
            new Date(createdAt),
            5
        );
    });

    it('addComment rejects empty text', async () => {
        await expect(
            service.addComment(1, '1', '2', { createdAt, text: '   ' })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('updateComment forbids non-owner', async () => {
        repo.getComment.mockResolvedValue({
            id: 'c1',
            userId: 2,
            text: 'hi',
            createdAt: new Date(),
        });
        await expect(
            service.updateComment(1, '1', '2', 'c1', {
                createdAt,
                text: 'new',
            })
        ).rejects.toMatchObject({ statusCode: 403 });
        expect(repo.updateCommentText).not.toHaveBeenCalled();
    });

    it('deleteComment forbids non-owner', async () => {
        repo.getComment.mockResolvedValue({
            id: 'c1',
            userId: 2,
            text: 'hi',
            createdAt: new Date(),
        });
        await expect(
            service.deleteComment(1, '1', '2', 'c1', { createdAt })
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('getShareStats returns count', async () => {
        repo.countShares.mockResolvedValue(7);
        const r = await service.getShareStats('1', '2', createdAt);
        expect(r).toEqual({ count: 7 });
    });

    it('save calls repository', async () => {
        repo.putSave.mockResolvedValue(undefined);
        await service.save(3, '1', '2', { createdAt });
        expect(repo.putSave).toHaveBeenCalledWith(
            1,
            2,
            new Date(createdAt),
            3
        );
    });

    it('getSavesSummary includes savedByMe', async () => {
        repo.listSaves.mockResolvedValue([1, 3]);
        repo.getSave.mockResolvedValue(true);
        const r = await service.getSavesSummary(1, '1', '2', createdAt);
        expect(r).toEqual({
            userIds: [1, 3],
            count: 2,
            savedByMe: true,
        });
    });

    it('repost returns ids from repository', async () => {
        const d = new Date('2025-06-01T00:00:00.000Z');
        repo.recordRepost.mockResolvedValue({
            repostId: 'REPOST#1#99',
            createdAt: d,
        });
        const r = await service.repost(1, '2', '3', { createdAt });
        expect(r.repostId).toBe('REPOST#1#99');
        expect(r.createdAt).toBe(d.toISOString());
    });
});
