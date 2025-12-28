import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const getDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a dummy or throw a more helpful error at runtime
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
};

export const db = process.env.DATABASE_URL ? getDb() : ({} as any);
