// Mock MongoDB implementation
console.log('📝 Using mock MongoDB implementation')

// Mock MongoDB client
class MockMongoClient {
  constructor() {
    console.log('🔄 Mock MongoDB client initialized')
    this.collections = {}
  }

  db(dbName) {
    console.log(`🗄️ Accessing database: ${dbName}`)
    return {
      collection: (collectionName) => this.getCollection(collectionName)
    }
  }

  getCollection(collectionName) {
    console.log(`📋 Accessing collection: ${collectionName}`)
    
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new MockCollection(collectionName)
    }
    
    return this.collections[collectionName]
  }
}

// Mock Collection implementation
class MockCollection {
  constructor(name) {
    this.name = name
    this.documents = []
    console.log(`✨ Created mock collection: ${name}`)
  }

  // Find operations
  find(query) {
    console.log(`🔍 find() on ${this.name} with query:`, query)
    return {
      toArray: async () => {
        console.log(`📄 Returning mock data for ${this.name}`)
        return this.documents.filter(doc => this.matchesQuery(doc, query))
      }
    }
  }

  findOne(query) {
    console.log(`🔍 findOne() on ${this.name} with query:`, query)
    return Promise.resolve(this.documents.find(doc => this.matchesQuery(doc, query)) || null)
  }

  // Insert operations
  insertOne(document) {
    const docWithId = { ...document, _id: `mock_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
    this.documents.push(docWithId)
    console.log(`➕ insertOne() on ${this.name}:`, docWithId)
    return Promise.resolve({ insertedId: docWithId._id, acknowledged: true })
  }

  insertMany(documents) {
    const docsWithIds = documents.map(doc => ({
      ...doc,
      _id: `mock_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))
    this.documents.push(...docsWithIds)
    console.log(`➕ insertMany() on ${this.name} - ${docsWithIds.length} documents`)
    return Promise.resolve({ insertedIds: docsWithIds.map(doc => doc._id), acknowledged: true })
  }

  // Update operations
  updateOne(filter, update) {
    console.log(`✏️ updateOne() on ${this.name} with filter:`, filter)
    console.log(`✏️ update:`, update)
    
    const index = this.documents.findIndex(doc => this.matchesQuery(doc, filter))
    if (index !== -1) {
      if (update.$set) {
        this.documents[index] = { ...this.documents[index], ...update.$set }
      }
      return Promise.resolve({ modifiedCount: 1, matchedCount: 1, acknowledged: true })
    }
    return Promise.resolve({ modifiedCount: 0, matchedCount: 0, acknowledged: true })
  }

  updateMany(filter, update) {
    console.log(`✏️ updateMany() on ${this.name} with filter:`, filter)
    console.log(`✏️ update:`, update)
    
    let modifiedCount = 0
    this.documents.forEach((doc, index) => {
      if (this.matchesQuery(doc, filter)) {
        if (update.$set) {
          this.documents[index] = { ...doc, ...update.$set }
        }
        modifiedCount++
      }
    })
    
    return Promise.resolve({ modifiedCount, matchedCount: modifiedCount, acknowledged: true })
  }

  // Delete operations
  deleteOne(filter) {
    console.log(`🗑️ deleteOne() on ${this.name} with filter:`, filter)
    
    const initialLength = this.documents.length
    this.documents = this.documents.filter(doc => !this.matchesQuery(doc, filter))
    const deletedCount = initialLength - this.documents.length
    
    return Promise.resolve({ deletedCount, acknowledged: true })
  }

  deleteMany(filter) {
    console.log(`🗑️ deleteMany() on ${this.name} with filter:`, filter)
    
    const initialLength = this.documents.length
    this.documents = this.documents.filter(doc => !this.matchesQuery(doc, filter))
    const deletedCount = initialLength - this.documents.length
    
    return Promise.resolve({ deletedCount, acknowledged: true })
  }

  // Simple query matcher
  matchesQuery(document, query) {
    if (!query || Object.keys(query).length === 0) {
      return true
    }
    
    return Object.entries(query).every(([key, value]) => {
      // Handle special operators
      if (key === '$or' && Array.isArray(value)) {
        return value.some(subQuery => this.matchesQuery(document, subQuery))
      }
      
      // Handle nested paths
      if (key.includes('.')) {
        const parts = key.split('.')
        let current = document
        for (const part of parts.slice(0, -1)) {
          current = current[part]
          if (current === undefined) return false
        }
        const lastPart = parts[parts.length - 1]
        return current[lastPart] === value
      }
      
      // Simple equality check
      return document[key] === value
    })
  }
}

// Create mock client
const mockClient = new MockMongoClient()
const clientPromise = Promise.resolve(mockClient)

export default clientPromise

// Export the mock client directly for more control in tests
export const mockDb = mockClient
