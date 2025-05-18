// /app/api/auth/logout/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  const response = NextResponse.redirect(new URL('/login', req.url))

  response.cookies.set('session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  return response
}
