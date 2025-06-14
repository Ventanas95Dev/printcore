import { NextResponse } from 'next/server'
import { geolocation } from '@vercel/functions'

export async function GET(req) {
  const location = geolocation(req)

  console.log(location)
  return NextResponse.json({
    location: {
      country: 'SE',
      name: 'Sweden',
      shipTo: true,
      market: 1,
      pricelist: 2,
      language: 'sv',
    },
  })
}
