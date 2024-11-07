import { afterAll, beforeAll } from 'vitest'
import App from '../../src/shared/App'
import * as mocks from '../mocks/mocks'
import { Test } from '@nestjs/testing'
import { AuthService } from '../../src/modules/auth/auth.service.ts'
import { ValidationPipe, forwardRef } from '@nestjs/common'
import {
  closeMongooseConnection,
  rootMongooseTestModule,
} from './MongooseTestModule.ts'
import { AuthModule } from '../../src/modules/auth/auth.module.ts'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from '../../src/modules/user/user.module.ts'
import { UserService } from '../../src/modules/user/user.service.ts'
import { MissionModule } from '../../src/modules/mission/mission.module.ts'

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: !process.env.NODE_ENV
          ? '.env'
          : `./env/.env.${process.env.NODE_ENV}`,
      }),
      rootMongooseTestModule(),
      AuthModule,
      forwardRef(() => UserModule),
      forwardRef(() => MissionModule),
    ],
  }).compile()

  const app = moduleRef.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    })
  )
  await app.init()

  App.server = app.getHttpServer()

  global.app = app
  global.moduleRef = moduleRef
  const usersService = moduleRef.get<UserService>(UserService)
  const authService = moduleRef.get<AuthService>(AuthService)

  await mocks.adminUser(usersService, authService)
  await mocks.randomUser(authService)
})

afterAll(async () => {
  await closeMongooseConnection()
  await App.server.close(() => {
    console.log('Finished all requests')
  })
})
