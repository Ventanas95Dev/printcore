import { NextResponse } from 'next/server'

export async function GET(req) {
  return NextResponse.json({
    languages: [
      {
        language: 'en',
        name: 'English',
        default: true,
      },
      {
        language: 'sv',
        name: 'Swedish',
        default: false,
      },
      {
        language: 'dk',
        name: 'Danish',
        default: false,
      },
      {
        language: 'no',
        name: 'Norwegian',
        default: false,
      },
    ],
  })
}
