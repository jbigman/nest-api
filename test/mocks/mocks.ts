import type { TokenPayload } from 'google-auth-library'
import type IUser from '../../src/modules/user/IUser.ts'
import type { UserService } from '../../src/modules/user/user.service.ts'
import type { AuthService } from '../../src/modules/auth/auth.service.ts'
import type { UserDocument } from '../../src/modules/user/user.model.ts'
import type { RentalRequestService } from '../../src/modules/rental-request/rental-request.service.ts'
import type { IPostRentalRequest } from '../../src/modules/rental-request/IRestRentalRequest.ts'
import type { LodgeService } from '../../src/modules/lodge/lodge.service.ts'
import type { IPostNewLodge } from '../../src/modules/lodge/IRestLodge.ts'

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

export const randomRentalRequest = async (
  rentalRequestService: RentalRequestService
) => {
  const payload: IPostRentalRequest = {
    from: 1715775338783,
    to: 1715775338783,
    price: 100,
    taxe: 10,
    total: 200,
    custom: {
      email: 'test@test.com',
      message: 'test',
    },
    options: {
      menage: false,
      nbLitSimple: 1,
      nbLitDouble: 1,
      nbLinge: 1,
      adults: 1,
      kids: 1,
      babies: 1,
    },
    billing: {
      firstName: 'test',
      lastName: 'test',
      phone: '0102030405',
      address: {
        line1: 'test',
        line2: 'test',
        city: 'test',
        state: 'test',
        postal_code: 'test',
        country: 'test',
      },
    },
  }
  await rentalRequestService.createRentalRequestAndPaymentIntent(payload)
}

export const randomLodge = async (
  lodgeService: LodgeService,
  userService: UserService
) => {
  const payload: IPostNewLodge = {
    name: 'lodgename',
    description: 'test',
    address: 'string',
    year: 2024,
    days: [],
  }
  const admin = await userService.getUserByEmail('gamewisherbot@gmail.com')
  if (!admin) {
    console.log('init lodge failed : no admin')
    return
  }
  await lodgeService.createLodgeInternal(payload, admin)
}
