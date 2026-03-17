// src/test-user-repository.ts
import { UserRepository } from "./repositories/user-repository.js";
import bcrypt from "bcrypt";

async function main() {
  const repo = new UserRepository();

  console.log("=== INICIO DE PRUEBAS ===");

  // 1️⃣ Crear usuario con password hash
  const rawPassword = "123456";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const newUser = await repo.create({
    name: "Juan Perez",
    email: "juan@example.com",
    password: hashedPassword,
    role: 0
  });
  console.log("Usuario creado:", newUser);

  // 2️⃣ Listar todos los usuarios
  const allUsers = await repo.findAll();
  console.log("Todos los usuarios:", allUsers);

  // 3️⃣ Buscar usuario por ID
  const userById = await repo.findById(newUser.id);
  console.log("Usuario por ID:", userById);

  // 4️⃣ Actualizar nombre y email
  const updatedUser = await repo.update(newUser.id, {
    name: "Juan Actualizado",
    email: "juan.actualizado@example.com"
  });
  console.log("Usuario actualizado:", updatedUser);

  // 5️⃣ Cambiar contraseña (hash incluido)
  const newPassword = "nuevaClave123";
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  const withNewPassword = await repo.updatePassword(newUser.id, newHashedPassword);
  console.log("Usuario con nueva contraseña:", withNewPassword);

  // 6️⃣ Eliminar usuario
  const deletedUser = await repo.delete(newUser.id);
  console.log("Usuario eliminado:", deletedUser);

  console.log("=== FIN DE PRUEBAS ===");
}

main()
  .then(() => console.log("Pruebas completadas ✅"))
  .catch((err) => console.error("Error en pruebas:", err))
  .finally(() => process.exit(0));