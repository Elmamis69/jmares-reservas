import { useEffect, useMemo, useState } from "react"
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import {
  listReservations,
  type Reservation,
} from "@/lib/api"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button } from "@/components/ui/button"
import ReservationDialog from "@/components/reservations/ReservationDialog"

const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
})

type Event = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Reservation
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draftStart, setDraftStart] = useState<Date | undefined>()
  const [draftEnd, setDraftEnd] = useState<Date | undefined>()
  const [editing, setEditing] = useState<Event | null>(null)

  async function load(s?: Date, e?: Date) {
    try {
      setLoading(true); setError(null)
      // si hay rango, filtramos por rango, si no cargamos todo
      const data = await (s && e ? listReservations({ start: s, end: e }) : listReservations())
      setEvents(
        data.map((r) => ({
          id: r.id,
          title: `${r.status} – ${r.client?.name ?? r.clientId.slice(0, 6)}`,
          start: new Date(r.startTime),
          end: new Date(r.endTime),
          resource: r,
        }))
      )
    } catch (err: any) {
      setError(err.message ?? "Error loading reservations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Cuando el usuario cambia de mes/semana/día, hacemos fetch por rango visible
  const onRangeChange = (r: any) => {
    let start: Date, end: Date
    if (Array.isArray(r)) {
      // En vista mensual, r es array de semanas
      start = r[0]
      end = r[r.length - 1]
    } else {
      start = r.start
      end = r.end
    }
    setRange({ start, end })
    load(start, end)
  }

  // Crear: abrir dialog con rango seleccionado
  async function handleSelectSlot(info: SlotInfo) {
    setEditing(null)
    setDraftStart(new Date(info.start))
    setDraftEnd(new Date(info.end))
    setDialogOpen(true)
  }

  // Editar: abrir dialog con la reserva actual
  async function handleSelectEvent(ev: Event) {
    setEditing(ev)
    setDraftStart(ev.start)
    setDraftEnd(ev.end)
    setDialogOpen(true)
  }

  // Colores por estado
  function eventPropGetter(e: Event) {
    const s = e.resource.status
    let bg = "#2563eb" // azul por defecto
    if (s === "CONFIRMADO") bg = "#16a34a" // verde
    if (s === "CANCELADO") bg = "#dc2626" // rojo
    return { style: { backgroundColor: bg, border: "none", color: "white" } }
  }

  const defaultDate = useMemo(() => new Date(), [])

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendario de Reservaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load(range?.start, range?.end)} disabled={loading}>
            Refrescar
          </Button>
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
        eventPropGetter={eventPropGetter}
      />

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing?.resource ?? null}
        defaultStart={draftStart}
        defaultEnd={draftEnd}
        onSaved={() => load(range?.start, range?.end)}
      />
    </div>
  )
}
