import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth/jwt.js'
import type { AppJwtPayload } from '../auth/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: AppJwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })
  try {
    req.user = verifyToken(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}

export function requireRole(...roles: Array<'ADMIN' | 'STAFF'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' })
    return next()
  }
}
