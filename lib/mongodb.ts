import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in your .env file"
  );
}

/**
 * Cached connection interface.
 * Stores the active Mongoose instance and any in-progress connection promise
 * so we can reuse them across hot reloads in development.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * In development, Next.js hot-reloads the module graph on every file change,
 * which would create a new connection on each reload without this cache.
 * We attach the cache to the Node.js global object so it persists across reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

// Persist the cache on the global object in development
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB using Mongoose and returns the cached connection.
 * Subsequent calls return the existing connection without opening a new one.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return the existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection attempt is in progress, start one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string).then((mongooseInstance) => {
      console.log("MongoDB connected successfully");
      return mongooseInstance;
    });
  }

  // Await the in-progress promise and cache the resolved connection
  cached.conn = await cached.promise;
  return cached.conn;
}
