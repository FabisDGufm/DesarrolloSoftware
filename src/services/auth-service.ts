import type { LoginDto } from "../models/user.js";
import { ForbiddenError, ValidationError } from "../utils/custom-errors.js";
import type { UserRepository } from "../repositories/user-repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
    constructor(private readonly userRepository: UserRepository) {}

    async loginAsync(dto: LoginDto) {
        if (!dto.email || !dto.password) {
            throw new ValidationError("Email and password are required");
        }

        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            throw new ValidationError("Invalid credentials");
        }

        const isValid = await bcrypt.compare(dto.password, user.password);

        if (!isValid) {
            throw new ValidationError("Invalid credentials");
        }

        if (user.accountStatus.toUpperCase() === "BANNED") {
            throw new ForbiddenError(
                "Tu cuenta fue inhabilitada. Contacta soporte si crees que es un error."
            );
        }

        const token = this.generateToken(
            user.id,
            user.email,
            user.name,
            user.university,
            user.role
        );

        return {
            user,
            authentication_token: token
        };
    }

    private generateToken(
        userId: number,
        email: string,
        name: string,
        university?: string | null,
        role?: number
    ): string {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;

        return jwt.sign(
            {
                sub: userId,
                email,
                name,
                university,
                role
            },
            jwtSecretKey,
            {
                expiresIn: "3d"
            }
        );
    }
}