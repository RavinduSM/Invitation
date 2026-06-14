import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthTokenPayload {
  userId: string
  userName: string
  userEmail: string
  userRole: 'admin' | 'editor' | 'viewer'
  iat?: number
  exp?: number
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable. Set JWT_SECRET in .env.local.')
  }
  return secret
}

export function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' })
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('token')?.value ?? null
}

export function requireAuth(req: NextRequest, requiredRole?: AuthTokenPayload['userRole']): AuthTokenPayload {
  const token = getTokenFromRequest(req)

  if (!token) {
    throw new Error('Unauthorized')
  }

  const payload = verifyToken(token)

  if (requiredRole && payload.userRole !== requiredRole) {
    throw new Error('Forbidden')
  }

  return payload
}
