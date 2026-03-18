import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.updateMany({
    data: {
      role: 'DEVELOPER',
      status: 'ACTIVE',
      accountType: 'STANDARD'
    }
  })
  console.log(`Updated ${users.count} users to DEVELOPER role.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
