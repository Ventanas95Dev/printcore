import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb'

const uri = 'inserhere'

if (!uri) {
  throw new Error('❌ Missing MONGODB_URI in environment variables')
}

let client
let clientPromise
let dbInstance = null

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb() {
  if (!clientPromise) {
    throw new Error(
      'MongoDB client is not initialized. Make sure NEXT_PUBLIC_LIVE_PREVIEW and MONGODB_URI are set.'
    )
  }

  if (dbInstance) return dbInstance

  const client = await clientPromise
  dbInstance = client.db('elobina ')
  return dbInstance
}

const passwordHash = await bcrypt.hash('password', 10)

const db = await getDb()
await db.collection('users').insertOne({
  email: 'mikael@devmob.se',
  name: 'Mikael',
  passwordHash,
  role: 'admin',
})

console.log('Admin user created')
