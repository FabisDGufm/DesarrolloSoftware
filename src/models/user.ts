export interface User {
    id: number;
    user: string;
    email: string;
    password: string;
    friends: number[];
    role: number;
    createdAt: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'friends'>;

export type UpdateUserDTO = Partial<CreateUserDTO>;