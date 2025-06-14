import { NextResponse } from 'next/server'
import { geolocation } from '@vercel/functions';

export async function GET(req) {
  const location = geolocation(req);

  return NextResponse.json(location)
}
