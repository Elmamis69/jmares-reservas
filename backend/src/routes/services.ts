import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { prisma } from "../db.js"

const r = Router()

const CreateService = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
})
const UpdateService = CreateService.partial()

r.get("/", async (_req, res) => {
  const list = await prisma.service.findMany({ orderBy: { createdAt: "desc" } })
  res.json(list)
})

r.post("/", async (req, res) => {
  const p = CreateService.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: "invalid_body", details: p.error.flatten() })
  const s = await prisma.service.create({ data: p.data })
  res.status(201).json(s)
})

r.put("/:id", async (req, res) => {
  const p = UpdateService.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: "invalid_body", details: p.error.flatten() })
  try {
    const s = await prisma.service.update({ where: { id: req.params.id }, data: p.data })
    res.json(s)
  } catch (e: any) {
    if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
    throw e
  }
})

r.delete("/:id", async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (e: any) {
    if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
    throw e
  }
})

export default r
