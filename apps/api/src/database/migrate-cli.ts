import { createDatabaseClient, parseDatabaseTarget } from './client.js';
import { runMigrations } from './migrate.js';

async function main() {
  const target = parseDatabaseTarget(process.argv[2] ?? 'dev');
  const client = createDatabaseClient(target);

  try {
    await client.connect();
    await runMigrations(client);
    console.log(`MIGRACIONES ${target.toUpperCase()} OK`);
  } finally {
    await client.end();
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Error de migración.');
  process.exitCode = 1;
}
