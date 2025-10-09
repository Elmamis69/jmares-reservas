import { Navigate, Outlet, useLocation } from "react-router-dom"
import { getToken } from "@/lib/auth"

export default function RequireAuth() {
  const token = getToken()
  const loc = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}
