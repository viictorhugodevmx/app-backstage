import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { AccessTokenService } from './access-token.service.js';
import type { AuthPrincipal } from './access-token.js';
import { REQUIRED_PERMISSIONS } from './require-permissions.decorator.js';

type AuthenticatedRequest = FastifyRequest & {
  principal?: AuthPrincipal;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokens: AccessTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer ([^\s]+)$/i.exec(authorization)
        : null;

    if (!match) {
      throw new UnauthorizedException('Se requiere un Bearer token.');
    }

    const principal = await this.tokens.verify(match[1]);

    const required =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (
      !required.every((permission) =>
        principal.permissions.includes(permission),
      )
    ) {
      throw new ForbiddenException('No tienes permiso para esta operación.');
    }

    request.principal = principal;

    return true;
  }
}
