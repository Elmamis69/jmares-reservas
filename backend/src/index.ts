import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import auth from './routes/auth.js'
import clients from './routes/clients.js'
import { requireAuth, requireRole } from './middleware/auth.js'
import reservations from './routes/reservations.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', auth)
app.use('/api/clients', requireAuth, requireRole('ADMIN', 'STAFF'), clients)
app.use('/api/reservations', requireAuth, requireRole('ADMIN','STAFF'), reservations)

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV ?? 'dev' })
})

const PORT = process.env.PORT ?? 8080
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
