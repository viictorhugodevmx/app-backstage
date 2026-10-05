import { createDatabaseClient, parseDatabaseTarget } from './client.js';

async function main() {
  const target = parseDatabaseTarget(process.argv[2] ?? 'dev');
  const client = createDatabaseClient(target);

  try {
    await client.connect();

    const result = await client.query<{
      database: string;
      user: string;
    }>('SELECT current_database() AS database, current_user AS "user"');

    console.table(result.rows);
    console.log(`CONEXIÓN ${target.toUpperCase()} OK`);
  } finally {
    await client.end();
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Error de conexión.');
  process.exitCode = 1;
}
