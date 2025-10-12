import { useEffect, useState } from "react"
import { listPackages, type Package } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PackageDialog from "@/components/packages/PackageDialog"

export default function PackagesPage() {
  const [items, setItems] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Package | null>(null)

  async function load() {
    try {
      setLoading(true); setError(null)
      setItems(await listPackages())
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
        <h1 className="text-xl font-semibold">Paquetes</h1>
        <Button onClick={() => { setCurrent(null); setOpen(true) }}>Nuevo paquete</Button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio base</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>${Number(p.basePrice).toFixed(2)}</TableCell>
              <TableCell className="max-w-[400px] truncate">{p.description}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => { setCurrent(p); setOpen(true) }}>Editar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PackageDialog open={open} onOpenChange={setOpen} initial={current} onSaved={load} />
    </div>
  )
}
