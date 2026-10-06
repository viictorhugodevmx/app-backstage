import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { errors, jwtVerify, type JWTVerifyGetKey } from 'jose';

export type AuthPrincipal = {
  subject: string;
  permissions: string[];
};

export type TokenConfig = {
  issuer: string;
  audience: string;
};

const invalidTokenCodes = new Set([
  'ERR_JWT_EXPIRED',
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWT_INVALID',
  'ERR_JWS_INVALID',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JWKS_NO_MATCHING_KEY',
]);

export async function verifyAccessToken(
  token: string,
  keyResolver: JWTVerifyGetKey,
  config: TokenConfig,
): Promise<AuthPrincipal> {
  try {
    const { payload } = await jwtVerify(token, keyResolver, {
      algorithms: ['RS256'],
      issuer: config.issuer,
      audience: config.audience,
      requiredClaims: ['sub', 'exp', 'iat'],
      clockTolerance: 5,
    });

    if (typeof payload.sub !== 'string' || !payload.sub.trim()) {
      throw new UnauthorizedException('Token inválido.');
    }

    const permissions = payload.permissions;

    if (
      permissions !== undefined &&
      (!Array.isArray(permissions) ||
        !permissions.every((value) => typeof value === 'string'))
    ) {
      throw new UnauthorizedException('Token inválido.');
    }

    return {
      subject: payload.sub,
      permissions: permissions === undefined ? [] : permissions,
    };
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (
      error instanceof errors.JOSEError &&
      invalidTokenCodes.has(error.code)
    ) {
      throw new UnauthorizedException('Token inválido o vencido.');
    }

    throw new ServiceUnavailableException(
      'No se pudo comprobar la autenticación.',
    );
  }
}
