import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { prisma } from "../db.js"

const r = Router()

// Body base
const Base = z.object({
    clientId: z.string().min(1),
    date: z.coerce.date(),           // fecha del evento (solo referencia)
    startTime: z.coerce.date(),      // inicio (Date ISO)
    endTime: z.coerce.date(),        // fin   (Date ISO)
    status: z.enum(["APARTADO", "CONFIRMADO", "CANCELADO"]).default("APARTADO"),
    attendees: z.number().int().nonnegative().optional(),
    total: z.number().nonnegative().optional(),
    deposit: z.number().nonnegative().optional(),
    packageId: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// Crear y actualizar
const CreateReservation = Base
    .refine(d => d.endTime > d.startTime, { message: "endTime must be after startTime" })
const UpdateReservation = CreateReservation.partial()

// Query params para rango
const RangeQuery = z.object({
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
})

// Comprobación de traslape (mismo rango se cruza)
async function hasOverlap(id: string | null, start: Date, end: Date) {
    const conflict = await prisma.reservation.findFirst({
        where: {
            ...(id ? { NOT: { id } } : {}),
            // (start < existingEnd) && (end > existingStart)
            startTime: { lt: end },
            endTime: { gt: start },
            status: { in: ["APARTADO", "CONFIRMADO"] }
        },
        select: { id: true }
    })
    return !!conflict
}

// LIST (opcionalmente por rango)
r.get("/", async (req: Request, res: Response) => {
    const { success, data } = RangeQuery.safeParse(req.query)
    const where = success && data.start && data.end
        ? { startTime: { gte: data.start }, endTime: { lte: data.end } }
        : {}

    const list = await prisma.reservation.findMany({
        where,
        orderBy: { startTime: "asc" },
        include: { client: true, package: true }
    })
    res.json(list)
})

// GET one
r.get("/:id", async (req, res) => {
    const item = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: { client: true, package: true, services: true, payments: true }
    })
    if (!item) return res.status(404).json({ error: "not_found" })
    res.json(item)
})

// CREATE
r.post("/", async (req, res) => {
    const parsed = CreateReservation.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() })
    }
    const d = parsed.data

    // limpiar clientId por si trae espacios
    const clientId = d.clientId.trim()
    if (await hasOverlap(null, d.startTime, d.endTime)) {
        return res.status(409).json({ error: "overlap" })
    }

    // Construir data sin mandar undefined
    const data: any = {
        clientId,
        date: d.date,
        startTime: d.startTime,
        endTime: d.endTime,
        status: d.status,
        total: d.total ?? 0,
        deposit: d.deposit ?? 0,
    }
    if (d.attendees !== undefined) data.attendees = d.attendees
    if (d.total !== undefined) data.total = d.total       // Decimal acepta number|string
    if (d.deposit !== undefined) data.deposit = d.deposit
    if (d.packageId !== undefined) data.packageId = d.packageId
    if (d.notes !== undefined) data.notes = d.notes

    try {
        const created = await prisma.reservation.create({ data })
        return res.status(201).json(created)
    } catch (e: any) {
        // FK inválida (clientId que no existe)
        if (e.code === "P2003") return res.status(400).json({ error: "bad_client", detail: "clientId not found" })
        // Log detallado para depurar rápido
        console.error("[reservations.create] error:", e)
        return res.status(500).json({ error: "server_error" })
    }
})



// UPDATE
r.put("/:id", async (req, res) => {
    const parsed = UpdateReservation.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() })
    const d = parsed.data

    if (d.startTime && d.endTime) {
        if (await hasOverlap(req.params.id, d.startTime, d.endTime))
            return res.status(409).json({ error: "overlap" })
    }

    const data: any = {}
    if (d.clientId !== undefined) data.clientId = d.clientId
    if (d.date !== undefined) data.date = d.date
    if (d.startTime !== undefined) data.startTime = d.startTime
    if (d.endTime !== undefined) data.endTime = d.endTime
    if (d.status !== undefined) data.status = d.status
    if (d.attendees !== undefined) data.attendees = d.attendees
    if (d.total !== undefined) data.total = d.total
    if (d.deposit !== undefined) data.deposit = d.deposit
    if (d.packageId !== undefined) data.packageId = d.packageId
    if (d.notes !== undefined) data.notes = d.notes

    try {
        const updated = await prisma.reservation.update({
            where: { id: req.params.id },
            data,
        })
        res.json(updated)
    } catch (e: any) {
        if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
        throw e
    }
})


// DELETE
r.delete("/:id", async (req, res) => {
    try {
        await prisma.reservation.delete({ where: { id: req.params.id } })
        res.status(204).end()
    } catch (e: any) {
        if (e.code === "P2025") return res.status(404).json({ error: "not_found" })
        throw e
    }
})

export default r
