import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import { AuthService } from '../auth/auth.service.js'
import type IRestUser from './IRestUser.js'
import { User, type UserDocument } from './user.model.js'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Pagination<UserDocument>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  userToRestUser = (
    user: UserDocument,
    token?: string,
    tokenExp?: number
  ): IRestUser => {
    const response: IRestUser = {
      token,
      tokenExp,
      id: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
    }

    return response
  }

  authenticateUser = async (token: string) => {
    console.log('authenticateUser', token)
    let payload: any
    try {
      payload = await this.authService.extractPayload(token)
    } catch (exception) {
       console.log('authenticateUser (exception)', exception)
      throw new UnauthorizedException()
    }

    if (!payload) {
      console.log('authenticateUser (no payload)')
      throw new UnauthorizedException()
    }

    let user = await this.userModel.findOne({ email: payload.email })
    if (!user) {
      // console.log('authenticateUser (not found)')
      user = await this.authService.createUser(payload)
      if (!user) {
        // console.log('authenticateUser (creation failed)')
        throw new BadRequestException()
      }
    }

    const response = this.userToRestUser(user, token, payload.exp)
    // console.log('Auth response:', JSON.stringify(response))
    return response
  }
}
