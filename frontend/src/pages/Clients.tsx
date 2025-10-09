import { useEffect, useState } from "react"
import { listClients, type Client } from "@/lib/api"
import ClientsTable from "@/components/clients/ClientsTable"
import NewClientDialog from "@/components/clients/NewClientDialog"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true); setError(null)
      const data = await listClients()
      setClients(data)
    } catch (err: any) {
      setError(err.message ?? "Error cargando clientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Refrescar</Button>
          <NewClientDialog onCreated={load} />
        </div>
      </div>
      {loading ? <p className="text-sm text-slate-500">Cargando...</p>
        : error ? <p className="text-sm text-red-600">{error}</p>
        : <ClientsTable clients={clients} />}
    </div>
  )
}
