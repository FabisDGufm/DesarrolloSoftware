export type ModerationTargetType = 'post' | 'user' | 'comment' | 'message' | 'help_message';

export type ModerationReportStatus = 'OPEN' | 'DISMISSED' | 'ACTION_TAKEN';

export interface ModerationReport {
    id: string;
    reporterId: number;
    targetType: ModerationTargetType;
    /** Ej. post: "authorId/postId", user: "123" */
    targetId: string;
    reason: string;
    status: ModerationReportStatus;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: number;
    resolutionNote?: string;
}
