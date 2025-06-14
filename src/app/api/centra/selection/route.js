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
    return { name: country, country: 'SE', shipTo: true, market: 1, pricelist: 2, language: 'sv' }
  }
  if (country === 'DA') {
    return { name: country, country: 'DA', shipTo: true, market: 1, pricelist: 3, language: 'dk' }
  }
  if (country === 'NO') {
    return { name: country, country: 'NO', shipTo: true, market: 1, pricelist: 4, language: 'no' }
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
    }
  }

  return { name: country, country: country, shipTo: true, market: 1, pricelist: 5, language: 'en' }
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
