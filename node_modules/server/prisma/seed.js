// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // организация
  const org = await prisma.organization.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'SharpCuts Barbershop',
      category: 'barbershop',
      address: 'Almaty, Dostyk 123',
    },
  });

  // специалист + график
  const spec = await prisma.specialist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Aidos',
      specialization: 'Barber',
      organizationId: org.id,
      schedules: {
        create: [
          { dayOfWeek: 1, startTimeMin: 10*60, endTimeMin: 19*60, slotSizeMin: 30 }, // Пн 10:00–19:00
          { dayOfWeek: 3, startTimeMin: 10*60, endTimeMin: 19*60, slotSizeMin: 30 }, // Ср
          { dayOfWeek: 5, startTimeMin: 12*60, endTimeMin: 20*60, slotSizeMin: 30 }, // Пт
        ]
      }
    },
  });

  console.log({ org, spec });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
