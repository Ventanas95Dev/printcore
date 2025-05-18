import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function POST(req) {
  const { email, password } = await req.json()
  const db = await getDb()
  const user = await db.collection('users').findOne({ email })

  console.log(email)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  console.log(user)
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()


  const jwt = await new SignJWT({ email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  cookieStore.set('session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json({ success: true })
}
