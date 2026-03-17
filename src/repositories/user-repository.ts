// src/repositories/user-repository.ts
import { prisma } from "../database/prisma.js";
import type { User, CreateUserDTO, UpdateUserDTO } from "../models/user.js";
import bcrypt from "bcryptjs"; // 🔑 para hashing

export class UserRepository {

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({ include: { auth: true } });
    return users.map(u => ({
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      password: u.auth?.password || "", // sigue usando tu campo password
      friends: [],
      role: 0,
      profilePhoto: "",
      createdAt: new Date()
    }));
  }

  async findById(id: number): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id }, include: { auth: true } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      password: u.auth?.password || "",
      friends: [],
      role: 0,
      profilePhoto: "",
      createdAt: new Date()
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { email }, include: { auth: true } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      password: u.auth?.password || "",
      friends: [],
      role: 0,
      profilePhoto: "",
      createdAt: new Date()
    };
  }

  async create(data: CreateUserDTO): Promise<User> {
    // 🔑 Hash de la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        auth: { create: { password: hashedPassword } } // mantiene tu campo auth.password
      },
      include: { auth: true }
    });

    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      password: user.auth?.password || "",
      friends: [],
      role: 0,
      profilePhoto: "",
      createdAt: new Date()
    };
  }

  async update(id: number, data: UpdateUserDTO): Promise<User | null> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { auth: true }
      });

      return {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        password: user.auth?.password || "",
        friends: [],
        role: 0,
        profilePhoto: "",
        createdAt: new Date()
      };
    } catch {
      return null;
    }
  }

  async updatePassword(id: number, password: string): Promise<User | null> {
    try {
      // 🔑 Hash antes de actualizar
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.authentication.update({
        where: { userId: id },
        data: { password: hashedPassword } // mantiene tu campo auth.password
      });

      return this.findById(id);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.delete({ where: { id }, include: { auth: true } });
      return {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        password: user.auth?.password || "",
        friends: [],
        role: 0,
        profilePhoto: "",
        createdAt: new Date()
      };
    } catch {
      return null;
    }
  }

  // 🔑 método extra para verificar contraseñas en login
  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}