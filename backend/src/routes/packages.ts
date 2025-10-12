import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"

const r = Router()

const CreatePackage = z.object({
  name: z.string().min(1),
  basePrice: z.number().nonnegative(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
})
const UpdatePackage = CreatePackage.partial()

r.get("/", async (_req, res) => {
  const list = await prisma.package.findMany({ orderBy: { createdAt: "desc" } })
  res.json(list)
})

r.post("/", async (req, res) => {
  const p = CreatePackage.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: "invalid_body", details: p.error.flatten() })
  const pkg = await prisma.package.create({ data: p.data })
  res.status(201).json(pkg)
})

r.put("/:id", async (req, res) => {
  const p = UpdatePackage.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: "invalid_body", details: p.error.flatten() })
  try {
    const pkg = await prisma.package.update({ where: { id: req.params.id }, data: p.data })
    res.json(pkg)
  } catch (e: any) {
    if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
    throw e
  }
})

r.delete("/:id", async (req, res) => {
  try {
    await prisma.package.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (e: any) {
    if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
    throw e
  }
})

export default r
