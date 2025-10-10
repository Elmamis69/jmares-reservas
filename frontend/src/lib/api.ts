import { getToken } from "@/lib/auth"
const BASE = "http://localhost:8080"

export type Client = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {})
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`${res.status} ${text || res.statusText}`)
  }
  return (res.status === 204 ? (undefined as T) : res.json())
}

// CRUD
export const listClients = () => api<Client[]>("/api/clients")
export const createClient = (data: Partial<Client>) =>
  api<Client>("/api/clients", { method: "POST", body: JSON.stringify(data) })
export const updateClient = (id: string, data: Partial<Client>) =>
  api<Client>(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deleteClient = (id: string) =>
  api<void>(`/api/clients/${id}`, { method: "DELETE" })
