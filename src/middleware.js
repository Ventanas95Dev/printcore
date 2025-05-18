import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login']

export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const session = req.cookies.get('session')?.value
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    await jwtVerify(session, new TextEncoder().encode(process.env.AUTH_SECRET))
    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
