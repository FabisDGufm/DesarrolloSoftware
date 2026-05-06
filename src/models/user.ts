export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    profilePhoto?: string; // URL o ruta de la foto
    friends: number[];
    /** 0 usuario, 1 moderador, 2 admin */
    role: number;
    /** ACTIVE | SUSPENDED | BANNED */
    accountStatus: string;
    suspendedUntil?: Date | null;
    createdAt: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'friends' | 'accountStatus' | 'suspendedUntil'>;

export type UpdateUserDTO = Partial<CreateUserDTO>;

export interface LoginDto {
    email: string;
    password: string;
}