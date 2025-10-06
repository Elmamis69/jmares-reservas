import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import clients from './routes/clients.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/clients', clients)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV ?? 'dev' })
})

const PORT = process.env.PORT ?? 8080
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
