import type { SessionOptions } from 'iron-session'

// Client session — used in /[slug] routes
export interface ClientSession {
  clientId: string
  slug: string
}

// Admin session — used in /admin routes
export interface AdminSession {
  isAdmin: true
}

export function getClientSessionOptions(): SessionOptions {
  return {
    cookieName: 'marching_client_session',
    password: process.env.SESSION_SECRET_CLIENT!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    },
  }
}

export function getAdminSessionOptions(): SessionOptions {
  return {
    cookieName: 'marching_admin_session',
    password: process.env.SESSION_SECRET_ADMIN!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      httpOnly: true,
      sameSite: 'strict',
    },
  }
}
