import type { Request, Response, NextFunction } from 'express';
import type { UserService } from '../services/user-service.js';
import type { CreateUserDTO } from '../models/user.js';
import { ValidationError } from '../utils/custom-errors.js';

export class UserController {
    constructor(private readonly userService: UserService) {}

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateUserDTO = req.body;
            const result = await this.userService.registerUser(userData);

            const { password, ...userWithoutPassword } = result.user;

            res.status(201).json({
                status: 'success',
                data: {
                    user: userWithoutPassword,
                    authentication_token: result.authentication_token
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            next(error);
        }
    };

    getUserByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const nameParam = req.params.name;

            if (!nameParam || typeof nameParam !== 'string') {
                throw new ValidationError('Name parameter is required');
            }

            const user = await this.userService.getUserByName(nameParam);

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    updateUserName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;

            const user = await this.userService.updateUserName(id, name);

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    updateUserEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const { email } = req.body;

            const user = await this.userService.updateUserEmail(id, email);

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    updateUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const { password } = req.body;

            const user = await this.userService.updateUserPassword(id, password);

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    updateProfilePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const { profilePhoto } = req.body;

            const user = await this.userService.updateProfilePhoto(id, profilePhoto);

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    // ✅ NUEVO ENDPOINT S3
    getUploadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { fileName } = req.query;

            if (!fileName || typeof fileName !== 'string') {
                throw new ValidationError('fileName is required');
            }

            const key = `profiles/${Date.now()}-${fileName}`;
            const url = await this.userService.getUploadUrl(key);

            res.status(200).json({
                status: 'success',
                data: { url, key }
            });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const result = await this.userService.deleteUser(id);

            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const friends = await this.userService.getFriends(id);

            res.status(200).json({
                status: 'success',
                data: friends
            });
        } catch (error) {
            next(error);
        }
    };
}