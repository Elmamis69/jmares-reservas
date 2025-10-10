import { Link, Outlet, useNavigate } from "react-router-dom"
import { clearToken } from "@/lib/auth"

export default function AppLayout() {
  const navigate = useNavigate()
  function logout() {
    clearToken()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
          <Link to="/dashboard" className="font-semibold">Jardín Mares</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/calendar">Calendario</Link>
          <Link to="/clients">Clientes</Link> {/* 👈 NUEVO */}
          <button onClick={logout} className="ml-auto underline text-slate-700">Salir</button>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
