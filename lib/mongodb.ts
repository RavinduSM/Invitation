import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local")
}

// ✅ Ensure TypeScript knows it's a string
const uri: string = MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend global type
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const globalWithCache = global as typeof globalThis & {
  mongooseCache?: MongooseCache
}

const cached: MongooseCache = globalWithCache.mongooseCache || {
  conn: null,
  promise: null,
}

// Save cache to global (important for hot reload in dev)
globalWithCache.mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  // If already connected, reuse connection
  if (cached.conn) {
    return cached.conn
  }

  // If no connection promise, create one
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    })
  }

  // Await the connection
  cached.conn = await cached.promise

  return cached.conn
}