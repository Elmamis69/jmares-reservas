import { getToken } from "@/lib/auth"

const BASE = "http://localhost:8080"

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
  return res.json()
}

export type Client = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export function listClients() {
  return api<Client[]>("/api/clients")
}

export function createClient(data: { name: string; phone?: string; email?: string; notes?: string }) {
  return api<Client>("/api/clients", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
