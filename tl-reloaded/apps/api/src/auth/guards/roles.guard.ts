import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@repo/db/types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    private roleHierarchy: Record<UserRole, number> = {
        [UserRole.student]: 1,
        [UserRole.teacher]: 2,
        [UserRole.admin]: 3,
    };

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }

        // Hierarchical check: user role must be at least as high as the highest required role
        // Or if multiple roles are required, we check if user has EXACTLY one of them (standard NestJS behavior)
        // But since this is hierarchical, if a route needs 'teacher', an 'admin' should also pass.

        const userRoleValue = this.roleHierarchy[user.role as UserRole] || 0;

        // Check if user role matches any of the required roles OR is higher than any of them
        return requiredRoles.some((role) => userRoleValue >= this.roleHierarchy[role]);
    }
}
