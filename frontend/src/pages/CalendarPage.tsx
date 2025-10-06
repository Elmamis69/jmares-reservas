import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale/en-US"

const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

export default function CalendarPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Calendario</h1>
            <Calendar
                localizer={localizer}
                events={[]} // vacío por ahora
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    )
}
