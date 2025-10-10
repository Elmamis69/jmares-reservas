import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'

const r = Router()

const CreateClient = z.object({
  name: z.string().min(1),
  phone: z.string().min(3).optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
})

const UpdateClient = CreateClient.partial()

// Listar todos
r.get('/', async (_req: Request, res: Response) => {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(clients)
})

// Obtener uno
r.get('/:id', async (req: Request, res: Response) => {
  const c = await prisma.client.findUnique({ where: { id: req.params.id } })
  if (!c) return res.status(404).json({ error: 'not_found' })
  res.json(c)
})

// Crear
r.post('/', async (req: Request, res: Response) => {
  const parsed = CreateClient.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error.flatten() })
  try {
    const created = await prisma.client.create({ data: parsed.data })
    res.status(201).json(created)
  } catch (e: any) {
    // Prisma unique violation (ej: email único)
    if (e.code === 'P2002') return res.status(409).json({ error: 'conflict', target: e.meta?.target })
    throw e
  }
})

// Actualizar
r.put('/:id', async (req: Request, res: Response) => {
  const parsed = UpdateClient.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error.flatten() })
  try {
    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: parsed.data,
    })
    res.json(updated)
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'conflict', target: e.meta?.target })
    if (e.code === 'P2025') return res.status(404).json({ error: 'not_found' })
    throw e
  }
})

// Borrar
r.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not_found' })
    throw e
  }
})

export default r
