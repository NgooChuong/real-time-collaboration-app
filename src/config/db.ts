// Placeholder DB connection. Replace with Mongo/Postgres/Prisma implementation.
export type DatabaseClient = unknown;

export const connectDB = async (): Promise<DatabaseClient> => {
  // Implement actual connection here (e.g., Mongoose/Prisma)
  // eslint-disable-next-line no-console
  console.log('[db]: connectDB placeholder called. No DB configured.');
  return {} as DatabaseClient;
};


