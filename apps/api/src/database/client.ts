import pg from 'pg';

export type DatabaseTarget = 'dev' | 'test';

export function parseDatabaseTarget(value: string): DatabaseTarget {
  if (value !== 'dev' && value !== 'test') {
    throw new Error('El destino debe ser dev o test.');
  }

  return value;
}

export function getDatabaseConfig(target: DatabaseTarget) {
  const isTest = target === 'test';
  const passwordKey = isTest ? 'DB_TEST_PASSWORD' : 'DB_APP_PASSWORD';
  const password = process.env[passwordKey];
  const host = process.env.PGHOST;
  const port = Number(process.env.PGPORT ?? 5432);

  if (!password || !host) {
    throw new Error(`Faltan PGHOST o ${passwordKey}.`);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PGPORT no es válido.');
  }

  return {
    host,
    port,
    user: isTest ? 'backstage_test' : 'backstage_app',
    database: isTest ? 'backstage_test' : 'backstage',
    password,
    connectionTimeoutMillis: 5000,
    application_name: `backstage-${target}`,
  };
}

export function createDatabaseClient(target: DatabaseTarget) {
  return new pg.Client(getDatabaseConfig(target));
}
