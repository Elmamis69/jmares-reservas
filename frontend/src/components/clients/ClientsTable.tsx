import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Client } from "@/lib/api"

type Props = {
  clients: Client[]
  onEdit: (c: Client) => void
  onDelete: (c: Client) => void
}

export default function ClientsTable({ clients, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.phone ?? "-"}</TableCell>
              <TableCell>{c.email ?? "-"}</TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <button className="text-sky-600 hover:underline" onClick={() => onEdit(c)}>Editar</button>
                <button className="text-red-600 hover:underline" onClick={() => onDelete(c)}>Borrar</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {clients.length === 0 && <p className="text-sm text-slate-500 mt-3">Sin clientes aún.</p>}
    </div>
  )
}
