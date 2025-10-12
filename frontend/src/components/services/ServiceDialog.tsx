import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createService, updateService, deleteService, type Service } from "@/lib/api"

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    initial?: Service | null
    onSaved: () => void
}

export default function ServiceDialog({ open, onOpenChange, initial, onSaved }: Props) {
    const [name, setName] = useState("")
    const [price, setPrice] = useState<string>("0")
    const [description, setDescription] = useState<string>("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initial) {
            setName(initial.name)
            setPrice(String(initial.price))
            setDescription(initial.description ?? "")
        } else {
            setName("")
            setPrice("0")
            setDescription("")
        }
    }, [initial, open])

    async function handleSave() {
        try {
            setSaving(true); setError(null)
            const body = { name, price: Number(price), description: description || undefined }
            if (initial) await updateService(initial.id, body)
            else await createService(body)
            onSaved(); onOpenChange(false)
        } catch (e: any) {
            setError(e.message ?? "Error")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!initial) return
        if (!confirm("¿Eliminar servicio?")) return
        await deleteService(initial.id)
        onSaved(); onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby="svc-desc">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
                    <DialogDescription id="svc-desc" className="sr-only">
                        Formulario para {initial ? "editar" : "crear"} un servicio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Nombre</label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Precio</label>
                        <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
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
