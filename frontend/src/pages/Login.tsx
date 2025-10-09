import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { setToken } from "@/lib/auth"

export default function Login() {
  const [email, setEmail] = useState("admin@jmares.local")
  const [password, setPassword] = useState("admin1234")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const redirectTo = location.state?.from?.pathname ?? "/dashboard"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error("Credenciales inválidas")
      const data = await res.json()
      setToken(data.token)
      navigate(redirectTo, { replace: true })
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold">Iniciar sesión</h1>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            className="border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  )
}
