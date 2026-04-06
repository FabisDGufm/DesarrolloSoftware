import { Router } from "express";
import { AuthService } from "../services/auth-service.js";
import { AuthController } from "../controllers/auth-controller.js";
import { UserRepository } from "../repositories/user-repository.js";

const authRoutes = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRoutes.post("/login", authController.login);

export default authRoutes;