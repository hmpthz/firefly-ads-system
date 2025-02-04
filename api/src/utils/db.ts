import mongoose, { STATES } from 'mongoose';

declare global {
  namespace Express {
    interface Locals {
      db: typeof mongoose;
    }
  }
}

export async function connectDatabase() {
  const state = mongoose.connection.readyState;
  if (state != STATES.connected && state != STATES.connecting) {
    const db_url = 'mongodb://127.0.0.1:5172/firefly';
    await mongoose.connect(db_url, { connectTimeoutMS: 3000 });
    console.log('Database connected.');
  }
  return mongoose;
}
