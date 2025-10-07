import jwt, { type SignOptions, type JwtPayload as JWTLibPayload } from 'jsonwebtoken'

export type AppJwtPayload = {
  sub: string
  email: string
  role: 'ADMIN' | 'STAFF'
}

const secret: jwt.Secret = process.env.JWT_SECRET || 'change-me'

// Acepta "7d", "12h", "30m", "45s" o un número en segundos
type JWTExpires = number | `${number}${'d' | 'h' | 'm' | 's'}`

function parseExpiresIn(v: string | undefined): JWTExpires {
  if (!v) return '7d' // default
  // Solo dígitos => segundos
  if (/^\d+$/.test(v)) return Number(v)
  // Formatos válidos: 7d, 12h, 30m, 45s
  if (/^\d+(d|h|m|s)$/.test(v)) return v as JWTExpires
  // Fallback seguro
  return '7d'
}

const expiresIn: JWTExpires = parseExpiresIn(process.env.JWT_EXPIRES_IN)

const signOpts: SignOptions = { expiresIn }

export function signToken(payload: AppJwtPayload) {
  return jwt.sign(payload, secret, signOpts)
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as AppJwtPayload & JWTLibPayload
}
