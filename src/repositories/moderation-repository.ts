import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { dynamo } from '../config/dynamodb.js';
import type {
    ModerationReport,
    ModerationReportStatus,
    ModerationTargetType,
} from '../models/moderation-report.js';

const TABLE = 'ModerationReports';

function parseMetaItem(item: Record<string, unknown> | undefined): ModerationReport | null {
    if (!item) return null;
    const id = item['reportId'];
    const reporterId = item['reporterId'];
    const targetType = item['targetType'];
    const targetId = item['targetId'];
    const reason = item['reason'];
    const status = item['status'];
    const createdAt = item['createdAt'];
    if (
        typeof id !== 'string' ||
        typeof reporterId !== 'number' ||
        typeof targetType !== 'string' ||
        typeof targetId !== 'string' ||
        typeof reason !== 'string' ||
        typeof status !== 'string' ||
        typeof createdAt !== 'string'
    ) {
        return null;
    }
    const resolvedAt = item['resolvedAt'];
    const resolvedBy = item['resolvedBy'];
    const resolutionNote = item['resolutionNote'];
    return {
        id,
        reporterId,
        targetType: targetType as ModerationTargetType,
        targetId,
        reason,
        status: status as ModerationReportStatus,
        createdAt,
        ...(typeof resolvedAt === 'string' ? { resolvedAt } : {}),
        ...(typeof resolvedBy === 'number' ? { resolvedBy } : {}),
        ...(typeof resolutionNote === 'string' ? { resolutionNote } : {}),
    };
}

export class ModerationRepository {
    async createReport(input: {
        reporterId: number;
        targetType: ModerationTargetType;
        targetId: string;
        reason: string;
    }): Promise<ModerationReport> {
        const id = randomUUID();
        const createdAt = new Date().toISOString();
        const gsi1sk = `TS#${createdAt}#${id}`;

        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK: `REPORT#${id}`,
                    SK: 'META',
                    reportId: id,
                    reporterId: input.reporterId,
                    targetType: input.targetType,
                    targetId: input.targetId.trim(),
                    reason: input.reason.trim(),
                    status: 'OPEN',
                    createdAt,
                    GSI1PK: 'OPEN',
                    GSI1SK: gsi1sk,
                },
            })
        );

        return {
            id,
            reporterId: input.reporterId,
            targetType: input.targetType,
            targetId: input.targetId.trim(),
            reason: input.reason.trim(),
            status: 'OPEN',
            createdAt,
        };
    }

    async listOpenReports(limit = 50): Promise<ModerationReport[]> {
        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                IndexName: 'ByStatus',
                KeyConditionExpression: 'GSI1PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': 'OPEN',
                },
                ScanIndexForward: false,
                Limit: limit,
            })
        );

        const out: ModerationReport[] = [];
        for (const item of r.Items ?? []) {
            const parsed = parseMetaItem(item as Record<string, unknown>);
            if (parsed) out.push(parsed);
        }
        return out;
    }

    async getReportById(reportId: string): Promise<ModerationReport | null> {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    PK: `REPORT#${reportId}`,
                    SK: 'META',
                },
            })
        );
        return parseMetaItem(r.Item as Record<string, unknown> | undefined);
    }

    async updateReportStatus(
        reportId: string,
        status: Exclude<ModerationReportStatus, 'OPEN'>,
        resolvedBy: number,
        resolutionNote?: string
    ): Promise<ModerationReport | null> {
        const resolvedAt = new Date().toISOString();
        const gsi1pk = status === 'DISMISSED' ? 'DISMISSED' : 'ACTION_TAKEN';

        try {
            await dynamo.send(
                new UpdateCommand({
                    TableName: TABLE,
                    Key: {
                        PK: `REPORT#${reportId}`,
                        SK: 'META',
                    },
                    UpdateExpression:
                        'SET #st = :st, GSI1PK = :gpk, resolvedAt = :ra, resolvedBy = :rb, resolutionNote = :note',
                    ConditionExpression: '#st = :open',
                    ExpressionAttributeNames: {
                        '#st': 'status',
                    },
                    ExpressionAttributeValues: {
                        ':st': status,
                        ':open': 'OPEN',
                        ':gpk': gsi1pk,
                        ':ra': resolvedAt,
                        ':rb': resolvedBy,
                        ':note': resolutionNote?.trim() ?? '',
                    },
                })
            );
        } catch {
            return null;
        }

        return this.getReportById(reportId);
    }
}
