export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    friends: number[];
    role: number;
    university?: string;
    createdAt: Date;
}
export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'friends'>;
export type UpdateUserDTO = Partial<CreateUserDTO>;
export interface LoginDto {
    email: string;
    password: string;
}
