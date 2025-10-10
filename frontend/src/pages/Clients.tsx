import { useEffect, useState } from "react"
import { listClients, deleteClient, type Client } from "@/lib/api"
import ClientsTable from "@/components/clients/ClientsTable"
import NewClientDialog from "@/components/clients/NewClientDialog"
import EditClientDialog from "@/components/clients/EditClientDialog"
import DeleteConfirm from "@/components/clients/DeleteConfirm"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState<Client | null>(null)

  async function load() {
    try { setLoading(true); setError(null); setClients(await listClients()) }
    catch (err: any) { setError(err.message ?? "Error cargando clientes") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteClient(deleting.id)
      setDeleting(null)
      load()
    } catch (err: any) {
      alert(err.message ?? "Error eliminando")
    }
  }

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
        : <ClientsTable
            clients={clients}
            onEdit={c => setEditing(c)}
            onDelete={c => setDeleting(c)}
          />
      }

      <EditClientDialog
        open={!!editing}
        client={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      <DeleteConfirm
        open={!!deleting}
        name={deleting?.name ?? ""}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
