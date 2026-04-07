import type { Request, Response, NextFunction } from "express";
import type { LoginDto } from "../models/user.js";
import type { AuthService } from "../services/auth-service.js";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const dto: LoginDto = req.body;

            const result = await this.authService.loginAsync(dto);

            const { password, ...userWithoutPassword } = result.user;

            res.status(200).json({
                status: "success",
                data: {
                    user: userWithoutPassword,
                    authentication_token: result.authentication_token
                }
            });
        } catch (error) {
            next(error);
        }
    };
}