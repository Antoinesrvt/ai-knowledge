import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Singleton pattern for database connection
class DatabaseClient {
  private static instance: DatabaseClient;
  private _db: ReturnType<typeof drizzle>;
  private _client: ReturnType<typeof postgres>;

  private constructor() {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is required');
    }

    // Configure postgres client with connection pooling
    this._client = postgres(process.env.POSTGRES_URL, {
      max: 20, // Maximum number of connections
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
    });

    this._db = drizzle(this._client, { schema });
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public get db() {
    return this._db;
  }

  public get client() {
    return this._client;
  }

  // Graceful shutdown method
  public async close() {
    await this._client.end();
  }
}

// Export the database instance
export const db = DatabaseClient.getInstance().db;
export const dbClient = DatabaseClient.getInstance().client;

// Export for cleanup in tests or shutdown
export const closeDatabase = () => DatabaseClient.getInstance().close();