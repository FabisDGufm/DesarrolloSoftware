import { MessageService } from '../../services/message-service.js';
import type { MessageRepository } from '../../repositories/message-repository.js';

describe('MessageService', () => {
    let repo: jest.Mocked<Pick<MessageRepository, 'sendMessage' | 'listConversation'>>;
    let service: MessageService;

    beforeEach(() => {
        repo = {
            sendMessage: jest.fn(),
            listConversation: jest.fn(),
        };
        service = new MessageService(repo as unknown as MessageRepository);
    });

    it('send rejects message to self', async () => {
        await expect(
            service.send(1, { toUserId: 1, text: 'hi' })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('send calls repository', async () => {
        const msg = {
            id: 'm1',
            fromUserId: 1,
            toUserId: 2,
            text: 'hello',
            createdAt: new Date(),
        };
        repo.sendMessage.mockResolvedValue(msg);
        const r = await service.send(1, { toUserId: 2, text: 'hello' });
        expect(r).toEqual(msg);
        expect(repo.sendMessage).toHaveBeenCalledWith(1, 2, 'hello');
    });

    it('listConversation validates other user', async () => {
        await expect(service.listConversation(1, 'x')).rejects.toMatchObject({
            statusCode: 400,
        });
    });
});
