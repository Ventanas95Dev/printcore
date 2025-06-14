import { NextResponse } from 'next/server'

export async function GET(req) {
  return NextResponse.json({
    markets: [
      {
        market: '1',
        name: 'Global',
        default: true,
      },
    ],
  })
}
