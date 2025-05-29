// src/repository/database.ts
import mongoose from 'mongoose';

export async function connect() {
    if (!process.env.DBHOST) throw new Error('DBHOST not provided');
    await mongoose.connect(process.env.DBHOST);
    await mongoose.connection.db!.admin().command({ ping: 1 });
    console.log('✔️ Connected to MongoDB');
  }

  
  export async function disconnect() {
    await mongoose.disconnect();
    console.log("🛑 Disconnected from MongoDB");
  }

// til scripts og engangs-jobs, ikke HTTP
export async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  try {
    await connect();
    return await operation();
  } finally {
    await disconnect();
  }
}

