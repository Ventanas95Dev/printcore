import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload?.role !== 'admin') return null

    return payload // e.g. { email, role }
  } catch {
    return null
  }
}
