import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

async function main() {
  const memdb = await initDevDb();
  console.log('\n_____________________\n');
  console.log(`MongoDB Memory Server is running...`);
  console.log(`Connection string: ${memdb.getUri()}\n`);
}

async function initDevDb() {
  const binPath = path.resolve(import.meta.dirname, '.db-bin');
  const dbPath = path.resolve(import.meta.dirname, '.db-data');
  console.log('[BIN PATH]', binPath);
  console.log('[DB PATH]', dbPath);

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
  }

  return await MongoMemoryServer.create({
    instance: {
      dbPath,
      port: 5172,
    },
    binary: {
      downloadDir: binPath,
    },
  });
}

main();
