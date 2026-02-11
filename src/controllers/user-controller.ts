import type { Request, Response } from 'express';
import type { UserService } from '../services/user-service.js';
import type { User } from '../models/user.js'


export class UserController {
    constructor(private readonly userService: UserService) {
        console.log("UserController initialized");
    }

    // Create
    registerUser = (_req: Request, _res: Response) => {
        let user : User = _req.body;
        let registerUser = this.userService.registerUser(user);

        _res.json(registerUser);
    }

    // Read all
    getUsers = (_req: Request, _res: Response) => {
        let users = this.userService.getAllUsers();
        _res.json(users);
    }

    // Read by name
    getUserbN = (_req: Request, _res: Response) => {
        let name = String(_req.params.name);
        let user = this.userService.getUserbN(name);
        _res.json(user);
    }

    // Update user name
    updateUserN = (_req: Request, _res: Response) => {
        let id = Number(_req.params.id);
        let { user } = _req.body;
        let result = this.userService.updateUserN(id, user);
        _res.json(result);
    }

    // Update user email
    updateUserEmail = (_req: Request, _res: Response) => {
        let id = Number(_req.params.id);
        let { email } = _req.body;
        let result = this.userService.updateUserEmail(id, email);
        _res.json(result);
    }

    // Update user password
    updateUserP = (_req: Request, _res: Response) => {
        let id = Number(_req.params.id);
        let { password } = _req.body;
        let result = this.userService.updateUserP(id, password);
        _res.json(result);
    }

    // Delete
    deleteUser = (_req: Request, _res: Response) => {
        let id = Number(_req.params.id);
        let result = this.userService.deleteUser(id);
        _res.json(result);
    }

    getFriends = (_req: Request, _res: Response) => {
        let id = Number(_req.params.id);
        let friends = this.userService.getFriends(id);
        _res.json(friends);
    }
}
