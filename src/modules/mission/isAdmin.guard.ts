
import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class IsAdminGuard implements CanActivate {
    constructor(
        @Inject(AuthService)
        private readonly authService: AuthService
    ) {}
    
    canActivate = async (context: ExecutionContext): Promise<boolean> => {
        const { token } = context.switchToHttp().getRequest();
        const user = await this.authService.getUser(token)
        return !!user?.isAdmin
    }
}
