declare global {
    namespace Express {
        interface Request {
            /** Set by `requireAuth` after validating Bearer JWT (`sub` = user id). */
            userId?: number;
        }
    }
}

export {};
