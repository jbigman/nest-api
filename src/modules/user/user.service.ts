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
  getUser = async (id: string): Promise<UserDocument | null> => {
    try {
      return await this.userModel.findById(id)
    } catch (error: any) {
      console.log('user.ctrl', error)
      return null
    }
  }

  saveUser = async (user: UserDocument) => {
    try {
      return await this.userModel.findOneAndUpdate({ email: user.email }, user)
    } catch (error: any) {
      console.log('auth.ctrl', error)
    }
  }

  getRestUser = async (userId: string, token: string) => {
    const user = await this.getUser(userId)
    if (!user) {
      return new NotFoundException()
    }

    const requester = await this.authService.getUserFromToken(token)
    return await this.userToRestUser(user)
  }

  editUser = async (body: { userName: string }, token: string) => {
    const user = await this.authService.getUserFromToken(token)

    if (!user) {
      return new UnauthorizedException()
    }

    if (body.userName !== '' && body.userName !== user.name) {
      user.name = body.userName
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: user._id.toString() },
        user,
        { new: true }
      )
      if (updatedUser) {
        return this.userToRestUser(updatedUser)
      }
      return new NotFoundException()
    }
  }

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

  getUserByEmail = async (email: string): Promise<UserDocument | null> => {
    try {
      return await this.userModel.findOne({ email })
    } catch (error: any) {
      console.log('user.ctrl', error)
      return null
    }
  }

  getUserFromToken = async (
    authorization?: string
  ): Promise<null | UserDocument> => {
    if (!authorization) {
      return null
    }
    return await this.authService.getUser(authorization)
  }

  authenticateUser = async (token: string) => {
    console.log('authenticateUser', token)
    let payload: any
    try {
      payload = await this.authService.extractPayload(token)
    } catch (exception) {
      // console.log('authenticateUser (exception)', exception)
      return new UnauthorizedException()
    }

    if (!payload) {
      //console.log('authenticateUser (no payload)')
      return new UnauthorizedException()
    }

    let user = await this.userModel.findOne({ email: payload.email })
    if (!user) {
      // console.log('authenticateUser (not found)')
      user = await this.authService.createUser(payload)
      if (!user) {
        // console.log('authenticateUser (creation failed)')
        return new BadRequestException()
      }
    }

    const response = this.userToRestUser(user, token, payload.exp)
    // console.log('Auth response:', JSON.stringify(response))
    return response
  }
}
