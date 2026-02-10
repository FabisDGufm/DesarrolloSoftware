import type { Request, Response } from 'express';
import { UserService } from '../services/user-service.js';


export class UserController {
    constructor(private userService: UserService) {
        console.log("UserController initialized");
    }

    register = (req: Request, res: Response) => {
        try {
            const user = this.userService.registerUser(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
