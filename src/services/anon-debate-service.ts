import { AnonDebateRepository } from "../repositories/anon-debate-repository.js";
import type { AnonDebate } from "../models/anon-debate.js";
import { ValidationError } from "../utils/custom-errors.js";

export class AnonDebateService {
    private repo: AnonDebateRepository;

    constructor(repo?: AnonDebateRepository) {
        this.repo = repo ?? new AnonDebateRepository();
    }

    async create(text: string, university: string): Promise<AnonDebate> {
        if (!text || text.trim() === '')
            throw new ValidationError('Text is required');
        if (text.length > 500)
            throw new ValidationError('Text must be under 500 characters');
        return this.repo.create({ text: text.trim(), university });
    }

    async listAll(): Promise<AnonDebate[]> {
        return this.repo.listAll();
    }

    async listByUniversity(university: string): Promise<AnonDebate[]> {
        return this.repo.listByUniversity(university);
    }
}
