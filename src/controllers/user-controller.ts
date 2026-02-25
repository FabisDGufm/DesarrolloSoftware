import type { Request, Response, NextFunction } from 'express';
import type { UserService } from '../services/user-service.js';
import type { CreateUserDTO } from '../models/user.js';
import { ValidationError } from '../utils/custom-errors.js';

export class UserController {
    constructor(private readonly userService: UserService) {
        console.log("UserController initialized");
    }

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateUserDTO = req.body;
            const newUser = this.userService.registerUser(userData);
            
            const { password, ...userWithoutPassword } = newUser;
            
            res.status(201).json({
                status: 'success',
                data: userWithoutPassword
            });
        } catch (error) {
            next(error);
        }
    }

    getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = this.userService.getAllUsers();
            res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    getUserbN = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const nameParam = req.params.name;
            
            if (!nameParam) {
                throw new ValidationError('Name parameter is required');
            }
            
            const name = Array.isArray(nameParam) ? nameParam[0] : nameParam;
            
            if (!name) {
                throw new ValidationError('Name parameter is required');
            }
            
            const user = this.userService.getUserbN(name);
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    updateUserN = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            const { name } = req.body;  // ← CAMBIO AQUÍ: 'name' en lugar de 'user'
            
            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }
            
            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
            
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }
            
            if (!name) {
                throw new ValidationError('Name is required');
            }
            
            const result = this.userService.updateUserN(id, name);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    updateUserEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            const { email } = req.body;
            
            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }
            
            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
            
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }
            
            if (!email) {
                throw new ValidationError('Email is required');
            }
            
            const result = this.userService.updateUserEmail(id, email);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    updateUserP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            const { password } = req.body;
            
            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }
            
            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
            
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }
            
            if (!password) {
                throw new ValidationError('Password is required');
            }
            
            const result = this.userService.updateUserP(id, password);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar foto de perfil
    updateProfilePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            const { profilePhoto } = req.body;

            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }

            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }

            const result = this.userService.updateProfilePhoto(id, profilePhoto ?? '');
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            
            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }
            
            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
            
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }
            
            const result = this.userService.deleteUser(id);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    getFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            
            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }
            
            const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
            
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }
            
            const friends = this.userService.getFriends(id);
            res.status(200).json({
                status: 'success',
                data: friends
            });
        } catch (error) {
            next(error);
        }
    }
}