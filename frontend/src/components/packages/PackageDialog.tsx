import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPackage, updatePackage, deletePackage, type Package } from "@/lib/api"

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    initial?: Package | null
    onSaved: () => void
}

export default function PackageDialog({ open, onOpenChange, initial, onSaved }: Props) {
    const [name, setName] = useState("")
    const [basePrice, setBasePrice] = useState<string>("0")
    const [description, setDescription] = useState<string>("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initial) {
            setName(initial.name)
            setBasePrice(String(initial.basePrice))
            setDescription(initial.description ?? "")
        } else {
            setName("")
            setBasePrice("0")
            setDescription("")
        }
    }, [initial, open])

    async function handleSave() {
        try {
            setSaving(true); setError(null)
            const body = { name, basePrice: Number(basePrice), description: description || undefined }
            if (initial) await updatePackage(initial.id, body)
            else await createPackage(body)
            onSaved(); onOpenChange(false)
        } catch (e: any) {
            setError(e.message ?? "Error")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!initial) return
        if (!confirm("¿Eliminar paquete?")) return
        await deletePackage(initial.id)
        onSaved(); onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby="pkg-desc">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar paquete" : "Nuevo paquete"}</DialogTitle>
                    <DialogDescription id="pkg-desc" className="sr-only">
                        Formulario para {initial ? "editar" : "crear"} un paquete.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Nombre</label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Precio base</label>
                        <Input type="number" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Descripción</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <DialogFooter>
                    {initial && (
                        <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                            Eliminar
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !name}>
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}
