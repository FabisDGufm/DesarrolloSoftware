export interface AnonDebate {
    university: string;
    createdAt: string;
    debateId: string;
    text: string;
}

export type CreateAnonDebateDTO = {
    text: string;
    university: string;
};
