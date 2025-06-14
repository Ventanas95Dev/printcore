import { NextResponse } from 'next/server'
import { geolocation } from '@vercel/functions'

export async function GET(req) {
  const location = geolocation(req)

  return NextResponse.json({
    token: randomInt(1000000, 9999999),
    location: { ...getRightLocation(location?.country) },
  })
}
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const getRightLocation = (country) => {
  if (country === 'SE') {
    return {
      name: country,
      country: 'SE',
      shipTo: true,
      market: 1,
      pricelist: 2,
      language: 'sv',
      currency: 'SEK',
    }
  }
  if (country === 'DA') {
    return {
      name: country,
      country: 'DA',
      shipTo: true,
      market: 1,
      pricelist: 3,
      language: 'dk',
      currency: 'DKK',
    }
  }
  if (country === 'NO') {
    return {
      name: country,
      country: 'NO',
      shipTo: true,
      market: 1,
      pricelist: 4,
      language: 'no',
      currency: 'NOK',
    }
  }

  const isEEA = isEEACountry(country) // true
  if (isEEA) {
    return {
      name: country,
      country: country,
      shipTo: true,
      market: 1,
      pricelist: 1,
      language: 'en',
      currency: 'EUR',
    }
  }

  return {
    name: country || 'US',
    country: country || 'US',
    shipTo: true,
    market: 1,
    pricelist: 5,
    language: 'en',
    currency: 'USD',
  }
}

function isEEACountry(countryCode) {
  return EEA_COUNTRIES.has(countryCode?.toUpperCase())
}
const EEA_COUNTRIES = new Set([
  // EU countries
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  // EEA but not EU
  'IS',
  'LI',
  'NO',
])
