import { createDatabaseClient, parseDatabaseTarget } from './client.js';
import { seedEvents } from './seed.js';

async function main() {
  const target = parseDatabaseTarget(process.argv[2] ?? 'dev');
  const client = createDatabaseClient(target);

  try {
    await client.connect();
    await client.query('BEGIN');

    let inserted: number;

    try {
      inserted = await seedEvents(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    const result = await client.query<{
      slug: string;
      title: string;
      status: string;
    }>('SELECT slug, title, status FROM public.events ORDER BY starts_at');

    console.table(result.rows);
    console.log(`SEED ${target.toUpperCase()} OK: ${inserted} eventos nuevos.`);
  } finally {
    await client.end();
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Error en el seed.');
  process.exitCode = 1;
}
