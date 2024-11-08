import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthService } from '../auth/auth.service.js'
import { IS_ADMIN_KEY, IsAdmin } from './isAdmin.decorator.js'

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private reflector: Reflector,
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    const isAdmin = this.reflector.get(IS_ADMIN_KEY, context.getHandler())
    if (isAdmin) {
      const result = context.switchToHttp().getRequest()
      const token = result.headers.authorization
      const user = await this.authService.getUser(token)
      console.log('IsAdminGuard', !!user?.isAdmin)
      return !!user?.isAdmin
    }
    console.log('canActivate')
    return true
  }
}
