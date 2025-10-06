import { Router } from 'express'
import { prisma } from '../db.js'

const r = Router()

r.get('/', async (_req, res) => {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(clients)
})

r.post('/', async (req, res) => {
  const { name, phone, email, notes } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const client = await prisma.client.create({ data: { name, phone, email, notes } })
  res.status(201).json(client)
})

export default r
