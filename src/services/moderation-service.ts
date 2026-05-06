import type { ModerationRepository } from '../repositories/moderation-repository.js';
import type { UserRepository } from '../repositories/user-repository.js';
import type { ModerationTargetType } from '../models/moderation-report.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/custom-errors.js';

const TARGET_TYPES = new Set<ModerationTargetType>([
    'post',
    'user',
    'comment',
    'message',
    'help_message',
]);

export class ModerationService {
    constructor(
        private readonly reports: ModerationRepository,
        private readonly users: UserRepository
    ) {}

    async createReport(
        reporterId: number,
        body: { targetType?: unknown; targetId?: unknown; reason?: unknown }
    ) {
        const targetType = body.targetType;
        const targetId = body.targetId;
        const reason = body.reason;
        if (typeof targetType !== 'string' || !TARGET_TYPES.has(targetType as ModerationTargetType)) {
            throw new ValidationError(
                'targetType invalido (post, user, comment, message, help_message).'
            );
        }
        if (typeof targetId !== 'string' || !targetId.trim()) {
            throw new ValidationError('targetId es requerido.');
        }
        if (typeof reason !== 'string' || !reason.trim()) {
            throw new ValidationError('reason es requerido.');
        }
        if (targetType === 'user' && Number.parseInt(targetId.trim(), 10) === reporterId) {
            throw new ValidationError('No podes reportarte a vos mismo.');
        }
        return this.reports.createReport({
            reporterId,
            targetType: targetType as ModerationTargetType,
            targetId: targetId.trim(),
            reason: reason.trim(),
        });
    }

    listOpenReports() {
        return this.reports.listOpenReports(100);
    }

    async resolveReport(
        moderatorId: number,
        reportId: string,
        body: { status?: unknown; resolutionNote?: unknown }
    ) {
        const st = body.status;
        if (st !== 'DISMISSED' && st !== 'ACTION_TAKEN') {
            throw new ValidationError('status debe ser DISMISSED o ACTION_TAKEN.');
        }
        const note = typeof body.resolutionNote === 'string' ? body.resolutionNote : undefined;
        const updated = await this.reports.updateReportStatus(reportId, st, moderatorId, note);
        if (!updated) {
            throw new NotFoundError('Reporte no encontrado o ya cerrado.');
        }
        return updated;
    }

    async suspendUser(
        moderatorId: number,
        targetUserId: number,
        body: { until?: unknown; reason?: unknown }
    ) {
        if (targetUserId === moderatorId) {
            throw new ForbiddenError('No podes suspenderte a vos mismo.');
        }
        const untilRaw = body.until;
        if (typeof untilRaw !== 'string' || !untilRaw.trim()) {
            throw new ValidationError('until (ISO 8601) es requerido para suspension.');
        }
        const until = new Date(untilRaw);
        if (Number.isNaN(until.getTime()) || until <= new Date()) {
            throw new ValidationError('until debe ser una fecha futura.');
        }
        const user = await this.users.updateAccountModeration(targetUserId, {
            accountStatus: 'SUSPENDED',
            suspendedUntil: until,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado.');
        return { userId: targetUserId, accountStatus: user.accountStatus, suspendedUntil: user.suspendedUntil };
    }

    async banUser(moderatorId: number, targetUserId: number) {
        if (targetUserId === moderatorId) {
            throw new ForbiddenError('No podes banearte a vos mismo.');
        }
        const user = await this.users.updateAccountModeration(targetUserId, {
            accountStatus: 'BANNED',
            suspendedUntil: null,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado.');
        return { userId: targetUserId, accountStatus: user.accountStatus };
    }

    async reinstateUser(_moderatorId: number, targetUserId: number) {
        const user = await this.users.updateAccountModeration(targetUserId, {
            accountStatus: 'ACTIVE',
            suspendedUntil: null,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado.');
        return { userId: targetUserId, accountStatus: user.accountStatus };
    }
}
