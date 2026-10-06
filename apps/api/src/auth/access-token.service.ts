import { Injectable } from '@nestjs/common';
import { createRemoteJWKSet } from 'jose';
import { verifyAccessToken, type TokenConfig } from './access-token.js';

@Injectable()
export class AccessTokenService {
  private verifier:
    | {
        keys: ReturnType<typeof createRemoteJWKSet>;
        config: TokenConfig;
      }
    | undefined;

  private getVerifier() {
    if (!this.verifier) {
      const domain = process.env.AUTH0_DOMAIN?.trim();
      const audience = process.env.AUTH0_AUDIENCE?.trim();

      if (
        !domain ||
        !/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.auth0\.com$/i.test(domain) ||
        !audience
      ) {
        throw new Error('Configuración de Auth0 incompleta o inválida.');
      }

      const issuer = `https://${domain}/`;

      this.verifier = {
        config: { issuer, audience },
        keys: createRemoteJWKSet(new URL('.well-known/jwks.json', issuer), {
          timeoutDuration: 5000,
          cooldownDuration: 30000,
          cacheMaxAge: 600000,
        }),
      };
    }

    return this.verifier;
  }

  async verify(token: string) {
    const { keys, config } = this.getVerifier();
    return await verifyAccessToken(token, keys, config);
  }
}
