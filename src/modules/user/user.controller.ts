import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
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

  @Get('/:userId')
  async getRestUser(
    @Param('userId') userId: string,
    @Headers('authorization') token: string
  ) {
    return await this.userService.getRestUser(userId, token)
  }

  @Post('/:userId/edit')
  async editUser(
    @Body() body: { userName: string },
    @Headers('authorization') token: string
  ) {
    return await this.userService.editUser(body, token)
  }
}
