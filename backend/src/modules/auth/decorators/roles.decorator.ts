import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../database/entities/dashboard-user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
