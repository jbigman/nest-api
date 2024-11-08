import {
  Body,
  Controller,
  Inject,
  Post,
  forwardRef,
} from '@nestjs/common'
import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  @Post('/auth')
  async authenticateUser(@Body() body: { token: string }) {
    return await this.userService.authenticateUser(body.token)
  }
}
