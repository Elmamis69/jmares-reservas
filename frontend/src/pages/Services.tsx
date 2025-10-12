import { useEffect, useState } from "react"
import { listServices, type Service } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ServiceDialog from "@/components/services/ServiceDialog"

export default function ServicesPage() {
    const [items, setItems] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState<Service | null>(null)

    async function load() {
        try {
            setLoading(true); setError(null)
            setItems(await listServices())
        } catch (e: any) {
            setError(e.message ?? "Error")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { load() }, [])

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Servicios</h1>
                <Button onClick={() => { setCurrent(null); setOpen(true) }}>Nuevo servicio</Button>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(s => (
                        <TableRow key={s.id}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>${Number(s.price).toFixed(2)}</TableCell>
                            <TableCell className="max-w-[400px] truncate">{s.description}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => { setCurrent(s); setOpen(true) }}>Editar</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ServiceDialog open={open} onOpenChange={setOpen} initial={current} onSaved={load} />
        </div>
    )
}
