import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateClient, type Client } from "@/lib/api"

type Props = {
  open: boolean
  client?: Client | null
  onClose: () => void
  onSaved: () => void
}

export default function EditClientDialog({ open, client, onClose, onSaved }: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (client) {
      setName(client.name ?? "")
      setPhone(client.phone ?? "")
      setEmail(client.email ?? "")
      setNotes(client.notes ?? "")
    }
  }, [client])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!client) return
    try {
      setLoading(true); setError(null)
      await updateClient(client.id, {
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      })
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message ?? "Error actualizando cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar cliente</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-2">
            <Label>Nombre *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Teléfono</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Notas</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
