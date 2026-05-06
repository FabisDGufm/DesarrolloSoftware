import type { HelpSpaceMeta, HelpSpaceMessage } from '../models/help-space.js';
import type { HelpSpaceRepository } from '../repositories/help-space-repository.js';
import { NotFoundError, ValidationError } from '../utils/custom-errors.js';

const HELP_SPACES: readonly HelpSpaceMeta[] = [
    {
        slug: 'general',
        title: 'General',
        description: 'Preguntas y ayuda general sobre la universidad y la app.',
    },
    {
        slug: 'matematicas',
        title: 'Matemáticas',
        description: 'Álgebra, cálculo, estadística y ejercicios.',
    },
    {
        slug: 'programacion',
        title: 'Programación',
        description: 'Código, proyectos, debugging y buenas prácticas.',
    },
    {
        slug: 'redaccion',
        title: 'Redacción e investigación',
        description: 'Ensayos, APA, métodos y presentaciones.',
    },
] as const;

const SLUG_SET = new Set(HELP_SPACES.map((s) => s.slug));

export class HelpSpaceService {
    constructor(private readonly repo: HelpSpaceRepository) {}

    listSpaces(): HelpSpaceMeta[] {
        return [...HELP_SPACES];
    }

    getSpaceMeta(slug: string): HelpSpaceMeta {
        const normalized = slug.trim().toLowerCase();
        if (!SLUG_SET.has(normalized)) {
            throw new NotFoundError('Espacio de ayuda no encontrado');
        }
        const meta = HELP_SPACES.find((s) => s.slug === normalized);
        if (!meta) throw new NotFoundError('Espacio de ayuda no encontrado');
        return meta;
    }

    async listMessages(
        slugRaw: string,
        limitRaw?: unknown,
        exclusiveStartKey?: Record<string, unknown>
    ): Promise<{ messages: HelpSpaceMessage[]; nextKey?: Record<string, unknown> }> {
        const slug = this.parseSlug(slugRaw);
        this.getSpaceMeta(slug);
        const limit =
            typeof limitRaw === 'string'
                ? Number.parseInt(limitRaw, 10)
                : typeof limitRaw === 'number'
                  ? limitRaw
                  : 50;
        const safe = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50;
        return this.repo.listMessages(slug, safe, exclusiveStartKey);
    }

    async postMessage(
        slugRaw: string,
        userId: number,
        body: { text?: unknown }
    ): Promise<HelpSpaceMessage> {
        const slug = this.parseSlug(slugRaw);
        this.getSpaceMeta(slug);
        if (typeof body.text !== 'string' || !body.text.trim()) {
            throw new ValidationError('text is required');
        }
        return this.repo.postMessage(slug, userId, body.text.trim());
    }

    private parseSlug(raw: string): string {
        const s = raw.trim().toLowerCase();
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
            throw new ValidationError('Invalid space slug');
        }
        return s;
    }
}
