import { useEffect, useMemo, useState } from "react"
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import {
  listReservations, createReservation, updateReservation, deleteReservation, type Reservation
} from "@/lib/api"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"

const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date()), getDay, locales })

type Event = { id: string; title: string; start: Date; end: Date; resource: Reservation }

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(s?: Date, e?: Date) {
    try {
      setLoading(true); setError(null)
      const data = await listReservations(s && e ? { start: s, end: e } : undefined)
      setEvents(
        data.map(r => ({
          id: r.id,
          title: `${r.status} - ${r.clientId.slice(0,6)}`, // luego mostraremos nombre real
          start: new Date(r.startTime),
          end: new Date(r.endTime),
          resource: r
        }))
      )
    } catch (err: any) {
      setError(err.message ?? "Error loading reservations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Cuando el usuario cambia de mes/semana/día, hacemos fetch por rango
  const onRangeChange = (r: any) => {
    let start: Date, end: Date
    if (Array.isArray(r)) {
      // mes retorna array de semanas
      start = r[0]
      end = r[r.length - 1]
    } else {
      start = r.start
      end = r.end
    }
    setRange({ start, end })
    load(start, end)
  }

  // Crear reserva rápida al seleccionar un rango en el calendario
  async function handleSelectSlot(info: SlotInfo) {
    const start = new Date(info.start)
    const end = new Date(info.end)
    const clientId = prompt("ID de cliente para apartar (por ahora usa uno del seed)") // luego haremos buscador
    if (!clientId) return
    try {
      await createReservation({
        clientId,
        date: start.toISOString(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: "APARTADO",
      })
      load(range?.start, range?.end)
    } catch (err: any) {
      alert(err.message.includes("overlap") ? "Conflicto: el horario se empalma con otra reserva" : err.message)
    }
  }

  async function handleSelectEvent(ev: Event) {
    const action = prompt("Acción: [e]ditar / [d]elete / [c]ancelar", "e")
    if (!action) return
    if (action.toLowerCase().startsWith("d")) {
      if (!confirm("¿Eliminar esta reservación?")) return
      await deleteReservation(ev.id)
      load(range?.start, range?.end)
      return
    }
    if (action.toLowerCase().startsWith("e")) {
      const newStart = new Date(prompt("Nueva hora inicio ISO", ev.start.toISOString()) || ev.start)
      const newEnd = new Date(prompt("Nueva hora fin ISO", ev.end.toISOString()) || ev.end)
      try {
        await updateReservation(ev.id, { startTime: newStart.toISOString(), endTime: newEnd.toISOString() })
        load(range?.start, range?.end)
      } catch (err: any) {
        alert(err.message.includes("overlap") ? "Conflicto: el horario se empalma con otra reserva" : err.message)
      }
    }
  }

  const defaultDate = useMemo(() => new Date(), [])

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendario de Reservaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load(range?.start, range?.end)} disabled={loading}>Refrescar</Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Calendar
        defaultDate={defaultDate}
        defaultView={Views.MONTH}
        localizer={localizer}
        events={events}
        style={{ height: "75vh" }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onRangeChange={onRangeChange}
      />
    </div>
  )
}
