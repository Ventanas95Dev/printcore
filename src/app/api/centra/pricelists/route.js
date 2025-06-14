import { NextResponse } from 'next/server'

export async function GET(req) {
  return NextResponse.json({
    pricelists: [
      {
        pricelist: '1',
        name: 'EUR',
        default: true,
        currency: {
          currency: 'EUR',
          name: 'EUR',
        },
      },
      {
        pricelist: '2',
        name: 'SEK',
        default: false,
        currency: {
          currency: 'SEK',
          name: 'SEK',
        },
      },
      {
        pricelist: '3',
        name: 'DKK',
        default: false,
        currency: {
          currency: 'DKK',
          name: 'DKK',
        },
      },
      {
        pricelist: '4',
        name: 'NOK',
        default: false,
        currency: {
          currency: 'NOK',
          name: 'NOK',
        },
      },
      {
        pricelist: '5',
        name: 'USD',
        default: false,
        currency: {
          currency: 'USD',
          name: 'USD',
        },
      },
    ],
  })
}
