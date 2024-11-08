import type { TokenPayload } from 'google-auth-library'
import type IUser from '../../src/modules/user/IUser.ts'
import type { UserService } from '../../src/modules/user/user.service.ts'
import type { AuthService } from '../../src/modules/auth/auth.service.ts'
import type { UserDocument } from '../../src/modules/user/user.model.ts'
import { vi } from 'vitest'

export const users: { admin?: UserDocument; randomUser?: UserDocument } = {
  admin: undefined,
  randomUser: undefined,
}

export const adminUser = async (
  usersService: UserService,
  authService: AuthService
) => {
  const newUser: IUser = {
    email: 'gamewisherbot@gmail.com',
    avatar:
      'https://www.gamewisher.com/_ipx/w_828,q_75/https%3A%2F%2Fplay-lh.googleusercontent.com%2Fx7XE14R-pf8_jxvE9yKzARNMpEcdbKjB7B_ylj-u4yu2NiO7u6iG1NpF7L9tAq7oM6Zk?url=https%3A%2F%2Fplay-lh.googleusercontent.com%2Fx7XE14R-pf8_jxvE9yKzARNMpEcdbKjB7B_ylj-u4yu2NiO7u6iG1NpF7L9tAq7oM6Zk&w=828&q=75',
    name: 'Bot',
    isAdmin: true,
  }
  const admin = await authService.create(newUser)
  if (!admin) {
    throw new Error('TEST - failed to create admin user')
  }
  users.admin = admin
  return usersService.userToRestUser(users.admin)
}

export const randomUser = async (authService: AuthService) => {
  const payload: TokenPayload = {
    iss: 'random',
    sub: 'random',
    aud: 'random',
    exp: 123,
    iat: 123,
    email: 'random@email.com',
    picture: 'random@email.com',
    name: 'random user',
  }
  const result = await authService.createUser(payload)
  users.randomUser = result
}
