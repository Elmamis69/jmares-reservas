import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DeleteConfirm({
  open, onClose, onConfirm, name
}: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Eliminar cliente</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-600">¿Seguro que deseas eliminar <b>{name}</b>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Eliminar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
