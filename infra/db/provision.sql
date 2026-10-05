\getenv app_password DB_APP_PASSWORD
\getenv test_password DB_TEST_PASSWORD

SELECT 'CREATE ROLE backstage_app LOGIN'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = 'backstage_app'
)
\gexec

SELECT 'CREATE ROLE backstage_test LOGIN'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = 'backstage_test'
)
\gexec

SELECT format(
  'ALTER ROLE backstage_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L',
  :'app_password'
)
\gexec

SELECT format(
  'ALTER ROLE backstage_test WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L',
  :'test_password'
)
\gexec

SELECT 'CREATE DATABASE backstage OWNER backstage_app'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = 'backstage'
)
\gexec

SELECT 'CREATE DATABASE backstage_test OWNER backstage_test'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = 'backstage_test'
)
\gexec

REVOKE CONNECT, TEMPORARY ON DATABASE backstage FROM PUBLIC;
REVOKE CONNECT, TEMPORARY ON DATABASE backstage_test FROM PUBLIC;

GRANT CONNECT, TEMPORARY ON DATABASE backstage TO backstage_app;
GRANT CONNECT, TEMPORARY ON DATABASE backstage_test TO backstage_test;
