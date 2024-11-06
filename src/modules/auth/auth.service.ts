import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OAuth2Client, type TokenPayload } from 'google-auth-library'
import mongoose from 'mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import type IUser from '../user/IUser.js'
import { User, type UserDocument } from '../user/user.model.js'

@Injectable()
export class AuthService {
  private googleClient
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Pagination<UserDocument>
  ) {
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
    })
  }

  getUserFromToken = async (
    authorization?: string
  ): Promise<null | UserDocument> => {
    if (!authorization) {
      return null
    }
    return await this.getUser(authorization)
  }

  getUser = async (token: string): Promise<null | UserDocument> => {
    if (!token) {
      return null
    }

    const t = token.split(' ')
    if (t.length > 1 && t[0] === 'Email') {
      return await this.getUserByEmail(t[1])
    }

    try {
      const payload = await this.extractPayload(token)
      if (payload?.email) {
        return await this.getUserByEmail(payload?.email)
      }
      return null
    } catch (error: any) {
      if (error?.message?.startsWith('Token used too late')) {
        return null
      }
      return null
    }
  }

  getUserByEmail = async (email: string) => {
    return await this.userModel.findOne({ email })
  }

  create = async (newUser: IUser) => {
    const createdUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...newUser,
    })
    return createdUser
  }

  createUser = async (payload: TokenPayload) => {
    const newUser: IUser = {
      email: payload.email ? payload.email : '',
      avatar: payload.picture ? payload.picture : '',
      name: payload.name ? payload.name : '',
      isAdmin: false,
    }
    return this.create(newUser)
  }

  getBot = async (): Promise<UserDocument | null> => {
    return await this.userModel.findOne({ email: 'gamewisherbot@gmail.com' })
  }

  extractPayload = async (token: string) => {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    })
    return ticket.getPayload()
  }
}

export const isAdmin = (user: UserDocument) => {
  if (!user) {
    return false
  }
  return user.isAdmin
}
