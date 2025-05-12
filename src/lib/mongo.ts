import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

if (!MONGO_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

// Extend the global object to include mongoose
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-ignore
let globalWithMongoose = global as typeof globalThis & { mongoose: MongooseCache };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (globalWithMongoose.mongoose.conn) {
      return globalWithMongoose.mongoose.conn;
    }

    if (!globalWithMongoose.mongoose.promise) {
      const opts = {
        bufferCommands: false,
      };

      globalWithMongoose.mongoose.promise = mongoose.connect(MONGO_URI, opts)
        .then((mongoose) => {
          const connected = true;
          return mongoose;
        })
        .catch((error) => {
          console.error('Erreur de connexion MongoDB:', error);
          throw error;
        });
    }

    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB:', error);
    throw error;
  }
}

export default dbConnect;
