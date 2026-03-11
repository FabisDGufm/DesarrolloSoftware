import { prisma } from "./src/lib/prisma.js"

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      password: "123456"
    }
  })

  console.log("Created user:", user)

  const allUsers = await prisma.user.findMany()

  console.log("All users:", allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })