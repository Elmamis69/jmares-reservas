# Jardín Mares – Reservation Manager

Full-stack application to manage events, clients, packages/services, and payments (Stripe / Mercado Pago) for the **Jardín Mares** business.

## Tech Stack (proposed)
- **Frontend:** React + Vite, Tailwind + shadcn/ui, `react-big-calendar`
- **Backend:** Node.js (Express or Nest), Prisma ORM
- **Database:** PostgreSQL
- **Payments:** Stripe and/or Mercado Pago (sandbox mode)
- **Auth:** JWT with httpOnly cookies (or Auth.js if using Next.js)
- **Local Infra:** Docker (Postgres + pgAdmin)

## Structure (monorepo)
jmares-reservas/
frontend/
backend/
README.md
.gitignore


## MVP (initial scope)
- Calendar with events (reserved / confirmed / canceled).
- CRUD for **Clients**, **Reservations**, **Packages**, and **Services**.
- Record **Payments** (method, reference, date).
- User roles (ADMIN, STAFF).
- Search by client/date with basic filters.

## Roadmap
- [x] Scaffold **frontend** (Vite + Tailwind + shadcn/ui + react-big-calendar).
- [ ] Scaffold **backend** (Express/Nest + Prisma + PostgreSQL + Docker Compose).
- [ ] Prisma modeling: Client, Reservation, Package, Service, Payment, User.
- [ ] Seed sample data (clients/packages/services).
- [ ] Basic Auth (login/logout, roles).
- [ ] CRUD **Client** (API + UI).
- [ ] CRUD **Package/Service** (API + UI).
- [ ] CRUD **Reservation** (API + UI + calendar).
- [ ] Record **Payments** (API + UI).
- [ ] Deploy **staging** environment (Render/Railway + Vercel/Netlify).
- [ ] Payment integration (Stripe/Mercado Pago sandbox).

## Environment Variables (placeholder)
- **FRONTEND:** `VITE_API_URL`
- **BACKEND:** `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET` / `MERCADOPAGO_ACCESS_TOKEN`

## Contribution
- Branch conventions: `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Keep PRs small and descriptive.
