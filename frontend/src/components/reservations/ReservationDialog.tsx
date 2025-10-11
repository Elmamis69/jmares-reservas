import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listClients, type Client, createReservation, updateReservation, type Reservation } from "@/lib/api"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Reservation | null
  defaultStart?: Date
  defaultEnd?: Date
  onSaved: () => void
}

export default function ReservationDialog({ open, onOpenChange, initial, defaultStart, defaultEnd, onSaved }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(initial?.clientId ?? "")
  const [start, setStart] = useState<string>(() => (initial ? initial.startTime : defaultStart?.toISOString() ?? new Date().toISOString()))
  const [end, setEnd] = useState<string>(() => (initial ? initial.endTime : defaultEnd?.toISOString() ?? new Date().toISOString()))
  const [status, setStatus] = useState<Reservation["status"]>(initial?.status ?? "APARTADO")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { (async () => { setClients(await listClients()) })() }, [])
  useEffect(() => {
    if (initial) {
      setClientId(initial.clientId)
      setStart(initial.startTime)
      setEnd(initial.endTime)
      setStatus(initial.status)
    } else {
      if (defaultStart) setStart(defaultStart.toISOString())
      if (defaultEnd) setEnd(defaultEnd.toISOString())
    }
  }, [initial, defaultStart, defaultEnd])

  async function handleSave() {
    try {
      setSaving(true); setError(null)
      const payload = {
        clientId,
        date: start,          // usamos start como “date” de referencia
        startTime: start,
        endTime: end,
        status,
      }
      if (initial) await updateReservation(initial.id, payload)
      else await createReservation(payload)
      onSaved()
      onOpenChange(false)
    } catch (e: any) {
      if (String(e.message ?? "").includes("overlap")) setError("Conflicto: se empalma con otra reservación.")
      else setError(e.message ?? "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar reservación" : "Nueva reservación"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Cliente</label>
            <select className="w-full border rounded px-2 py-2"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
            >
              <option value="">Seleccione un cliente…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Inicio</label>
            <Input
              type="datetime-local"
              value={isoToLocal(start)}
              onChange={e => setStart(localToIso(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Fin</label>
            <Input
              type="datetime-local"
              value={isoToLocal(end)}
              onChange={e => setEnd(localToIso(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Estado</label>
            <select className="w-full border rounded px-2 py-2"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
            >
              <option>APARTADO</option>
              <option>CONFIRMADO</option>
              <option>CANCELADO</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !clientId}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// helpers para datetime-local
function isoToLocal(iso: string) {
  const d = new Date(iso)
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return tz.toISOString().slice(0,16)
}
function localToIso(local: string) {
  const d = new Date(local)
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toISOString()
}
