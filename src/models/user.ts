export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    friends: number[];
    createdAt: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'friends'>;

export type UpdateUserDTO = Partial<CreateUserDTO>;