// Database connection switcher for Docker vs Development
import * as schema from "@shared/schema";

async function createDatabase() {
  if (process.env.USE_DOCKER_DB === 'true') {
    // Use standard PostgreSQL driver for Docker
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set for Docker deployment");
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  } else {
    // Use Neon serverless driver for development/production
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const ws = await import("ws");
    
    neonConfig.webSocketConstructor = ws.default;
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  }
}

export const db = createDatabase();