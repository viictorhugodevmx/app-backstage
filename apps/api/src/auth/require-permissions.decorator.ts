import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS = 'backstage:required-permissions';

export function RequirePermissions(...permissions: string[]) {
  return SetMetadata(REQUIRED_PERMISSIONS, permissions);
}
