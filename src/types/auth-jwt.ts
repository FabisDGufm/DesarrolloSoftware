import type { JwtPayload } from 'jsonwebtoken';

export type AuthJwtPayload = JwtPayload & {
    sub: number;
    email?: string;
};
