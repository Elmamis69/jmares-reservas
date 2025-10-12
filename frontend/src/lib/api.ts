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

// --- Services ---
export type Service = {
  id: string
  name: string
  price: number | string
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function listServices() {
  return api<Service[]>("/api/services")
}
export async function createService(data: { name: string; price: number; description?: string | null; active?: boolean }) {
  return api<Service>("/api/services", { method: "POST", body: JSON.stringify(data) })
}
export async function updateService(id: string, data: Partial<{ name: string; price: number; description?: string | null; active?: boolean }>) {
  return api<Service>(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(data) })
}
export async function deleteService(id: string) {
  return api<void>(`/api/services/${id}`, { method: "DELETE" })
}

// --- Packages ---
export type Package = {
  id: string
  name: string
  basePrice: number | string
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function listPackages() {
  return api<Package[]>("/api/packages")
}
export async function createPackage(data: { name: string; basePrice: number; description?: string | null; active?: boolean }) {
  return api<Package>("/api/packages", { method: "POST", body: JSON.stringify(data) })
}
export async function updatePackage(id: string, data: Partial<{ name: string; basePrice: number; description?: string | null; active?: boolean }>) {
  return api<Package>(`/api/packages/${id}`, { method: "PUT", body: JSON.stringify(data) })
}
export async function deletePackage(id: string) {
  return api<void>(`/api/packages/${id}`, { method: "DELETE" })
}


// CRUD
export const listClients = () => api<Client[]>("/api/clients")
export const createClient = (data: Partial<Client>) =>
  api<Client>("/api/clients", { method: "POST", body: JSON.stringify(data) })
export const updateClient = (id: string, data: Partial<Client>) =>
  api<Client>(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deleteClient = (id: string) =>
  api<void>(`/api/clients/${id}`, { method: "DELETE" })

// --- Reservations ---
export type Reservation = {
  id: string
  clientId: string
  client?: { id: string; name: string } //
  date: string
  startTime: string
  endTime: string
  status: "APARTADO" | "CONFIRMADO" | "CANCELADO"
  attendees?: number | null
  total?: number | null
  deposit?: number | null
  packageId?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export const listReservations = (params?: { start?: Date; end?: Date }) => {
  const q = new URLSearchParams()
  if (params?.start) q.set("start", params.start.toISOString())
  if (params?.end) q.set("end", params.end.toISOString())
  const qs = q.toString() ? `?${q.toString()}` : ""
  return api<Reservation[]>(`/api/reservations${qs}`)
}

export const createReservation = (data: Partial<Reservation>) =>
  api<Reservation>("/api/reservations", { method: "POST", body: JSON.stringify(data) })

export const updateReservation = (id: string, data: Partial<Reservation>) =>
  api<Reservation>(`/api/reservations/${id}`, { method: "PUT", body: JSON.stringify(data) })

export const deleteReservation = (id: string) =>
  api<void>(`/api/reservations/${id}`, { method: "DELETE" })
