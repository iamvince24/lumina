// lib/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// 停用 "prefetch" 可以避免 Serverless 環境下的一些警告
const client = postgres(connectionString, { prepare: false });

// 建立 Drizzle 實例
export const db = drizzle(client, { schema });
