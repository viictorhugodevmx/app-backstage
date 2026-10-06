import { Auth0Client } from '@auth0/nextjs-auth0/server';

let client: Auth0Client | undefined;

export function getAuth0(): Auth0Client {
  if (!client) {
    const required = [
      'AUTH0_DOMAIN',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET',
      'AUTH0_SECRET',
      'APP_BASE_URL',
      'AUTH0_AUDIENCE',
    ] as const;

    for (const name of required) {
      if (!process.env[name]?.trim()) {
        throw new Error(`Falta configurar ${name}.`);
      }
    }

    client = new Auth0Client({
      enableAccessTokenEndpoint:
        process.env.NODE_ENV !== 'production' &&
        process.env.AUTH0_ENABLE_ACCESS_TOKEN_ENDPOINT === 'true',
      authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
        scope:
          'openid profile email read:events create:events update:events cancel:events',
      },
    });
  }

  return client;
}
