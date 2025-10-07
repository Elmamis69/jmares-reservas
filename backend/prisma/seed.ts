import { PrismaClient, Status, PaymentMethod, Role } from '@prisma/client'
import { addHours, setHours, setMinutes, setSeconds, addDays } from 'date-fns'
import { hashPassword } from '../src/auth/hash.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // 🔐 Hash real para el admin (login: admin@jmares.local / admin1234)
  const adminPassword = await hashPassword('admin1234')

  // Usuarios (upsert con UPDATE para reemplazar el hash si ya existía)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jmares.local' },
    update: {
      name: 'Admin',
      role: Role.ADMIN,
      passwordHash: adminPassword,
    },
    create: {
      name: 'Admin',
      email: 'admin@jmares.local',
      role: Role.ADMIN,
      passwordHash: adminPassword,
    },
  })

  // Clientes
  const [c1, c2, c3] = await Promise.all([
    prisma.client.upsert({
      where: { email: 'maria@example.com' },
      update: {},
      create: { name: 'María López', phone: '644-111-1111', email: 'maria@example.com' },
    }),
    prisma.client.upsert({
      where: { email: 'carlos@example.com' },
      update: {},
      create: { name: 'Carlos Pérez', phone: '644-222-2222', email: 'carlos@example.com' },
    }),
    prisma.client.upsert({
      where: { email: 'ana@example.com' },
      update: {},
      create: { name: 'Ana Ruiz', phone: '644-333-3333', email: 'ana@example.com' },
    }),
  ])

  // Servicios catálogo (idempotente por nombre)
  const [s1, s2, s3] = await Promise.all([
    prisma.service.upsert({
      where: { name: 'Banquete básico' },
      update: { price: 12000.00, description: 'Comida y bebidas estándar', active: true },
      create: { name: 'Banquete básico', price: 12000.00, description: 'Comida y bebidas estándar', active: true },
    }),
    prisma.service.upsert({
      where: { name: 'DJ & Audio' },
      update: { price: 5000.00, description: 'Música + audio profesional', active: true },
      create: { name: 'DJ & Audio', price: 5000.00, description: 'Música + audio profesional', active: true },
    }),
    prisma.service.upsert({
      where: { name: 'Decoración' },
      update: { price: 7000.00, description: 'Flores, centros de mesa y luces', active: true },
      create: { name: 'Decoración', price: 7000.00, description: 'Flores, centros de mesa y luces', active: true },
    }),
  ])

  // Paquetes catálogo (idempotente por nombre)
  const [p1, p2] = await Promise.all([
    prisma.package.upsert({
      where: { name: 'Boda Esencial' },
      update: { basePrice: 35000.00, description: 'Paquete base para bodas', active: true },
      create: { name: 'Boda Esencial', basePrice: 35000.00, description: 'Paquete base para bodas', active: true },
    }),
    prisma.package.upsert({
      where: { name: 'XV Premium' },
      update: { basePrice: 42000.00, description: 'Paquete premium para XV años', active: true },
      create: { name: 'XV Premium', basePrice: 42000.00, description: 'Paquete premium para XV años', active: true },
    }),
  ])

  // Reservación de ejemplo: mañana 17:00–22:00
  const now = new Date()
  const tomorrow = addDays(now, 1)
  const start = setSeconds(setMinutes(setHours(tomorrow, 17), 0), 0)
  const end = addHours(start, 5)

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
        ],
      },
      payments: {
        create: [
          { amount: 5000.00, method: PaymentMethod.TRANSFER, reference: 'DEP-0001' },
        ],
      },
    },
    include: { services: true, payments: true },
  })

  console.log('Seed done:', {
    admin: admin.email,
    clients: [c1.email, c2.email, c3.email],
    reservation: reservation.id,
  })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
