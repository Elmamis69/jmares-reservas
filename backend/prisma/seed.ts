import { PrismaClient, Status, PaymentMethod, Role } from '@prisma/client'
import { addHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Usuarios
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jmares.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@jmares.local',
      role: Role.ADMIN,
      // HASH FAKE SOLO PARA DEMO (no usar en prod)
      passwordHash: 'admin-hash-demo'
    }
  })

  // Clientes
  const [c1, c2, c3] = await Promise.all([
    prisma.client.create({ data: { name: 'María López', phone: '644-111-1111', email: 'maria@example.com' } }),
    prisma.client.create({ data: { name: 'Carlos Pérez', phone: '644-222-2222', email: 'carlos@example.com' } }),
    prisma.client.create({ data: { name: 'Ana Ruiz',   phone: '644-333-3333', email: 'ana@example.com' } }),
  ])

  // Servicios
  const [s1, s2, s3] = await Promise.all([
    prisma.service.create({ data: { name: 'Banquete básico', price: 12000.00, description: 'Comida y bebidas estándar' } }),
    prisma.service.create({ data: { name: 'DJ & Audio',      price:  5000.00, description: 'Música + audio profesional' } }),
    prisma.service.create({ data: { name: 'Decoración',      price:  7000.00, description: 'Flores, centros de mesa y luces' } }),
  ])

  // Paquetes
  const [p1, p2] = await Promise.all([
    prisma.package.create({ data: { name: 'Boda Esencial', basePrice: 35000.00, description: 'Paquete base para bodas' } }),
    prisma.package.create({ data: { name: 'XV Premium',    basePrice: 42000.00, description: 'Paquete premium para XV años' } }),
  ])

  // Reservación de ejemplo (mañana 17:00–22:00)
  const start = addHours(new Date(), 24 + (17 - new Date().getHours())) // aproxima mañana 17h
  const end   = addHours(start, 5)

  const reservation = await prisma.reservation.create({
    data: {
      clientId: c1.id,
      date: start,
      startTime: start,
      endTime: end,
      status: Status.APARTADO,
      attendees: 120,
      total: 35000.00,
      deposit: 5000.00,
      packageId: p1.id,
      services: {
        create: [
          { serviceId: s2.id, quantity: 1 }, // DJ
          { serviceId: s3.id, quantity: 1 }, // Decoración
        ]
      },
      payments: {
        create: [
          { amount: 5000.00, method: PaymentMethod.TRANSFER, reference: 'DEP-0001' }
        ]
      }
    },
    include: { services: true, payments: true }
  })

  console.log('Seed done:', { admin: admin.email, clients: [c1.email, c2.email, c3.email], reservation: reservation.id })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
