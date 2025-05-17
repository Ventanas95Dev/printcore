import NextCors from 'nextjs-cors'

export async function applyCors(req) {
  return await NextCors(req, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  })
}
