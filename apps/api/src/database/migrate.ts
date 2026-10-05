import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Client } from 'pg';

const lockKey = 2048105;
const migrationsDirectory = fileURLToPath(
  new URL('../../migrations/', import.meta.url),
);

export async function runMigrations(client: Client) {
  const lock = await client.query<{ acquired: boolean }>(
    'SELECT pg_try_advisory_lock($1) AS acquired',
    [lockKey],
  );

  if (!lock.rows[0]?.acquired) {
    throw new Error('Ya hay otro proceso de migraciones en ejecución.');
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => /^\d{3,}_[a-z0-9_]+\.sql$/.test(name))
      .sort();

    const history = await client.query<{
      name: string;
      checksum: string;
    }>('SELECT name, checksum FROM public.schema_migrations ORDER BY name');

    const applied = new Map(
      history.rows.map((row) => [row.name, row.checksum]),
    );

    for (const name of applied.keys()) {
      if (!files.includes(name)) {
        throw new Error(`Falta la migración ya aplicada: ${name}`);
      }
    }

    const migrations = [];

    for (const name of files) {
      const sql = await readFile(`${migrationsDirectory}/${name}`, 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');

      if (applied.has(name) && applied.get(name) !== checksum) {
        throw new Error(`La migración aplicada fue modificada: ${name}`);
      }

      migrations.push({ name, sql, checksum });
    }

    let count = 0;

    for (const migration of migrations) {
      if (applied.has(migration.name)) {
        continue;
      }

      await client.query('BEGIN');

      try {
        await client.query(migration.sql);
        await client.query(
          `INSERT INTO public.schema_migrations (name, checksum)
           VALUES ($1, $2)`,
          [migration.name, migration.checksum],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }

      count += 1;
      console.log(`APLICADA: ${migration.name}`);
    }

    console.log(`Migraciones nuevas aplicadas: ${count}`);
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [lockKey]);
  }
}
