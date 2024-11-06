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
import { RentalRequestModule } from '../../src/modules/rental-request/rental-request.module.ts'
import { UserModule } from '../../src/modules/user/user.module.ts'
import { UserService } from '../../src/modules/user/user.service.ts'
import { RentalRequestService } from '../../src/modules/rental-request/rental-request.service.ts'
import { LodgeModule } from '../../src/modules/lodge/lodging.module.ts'
import { LodgeService } from '../../src/modules/lodge/lodge.service.ts'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailerModule } from '@nestjs-modules/mailer'

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      MailerModule.forRootAsync({
        useFactory: () => ({
          transport: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT
              ? Number.parseInt(process.env.SMTP_PORT)
              : 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
          defaults: {
            from: '"nest-modules" <modules@nestjs.com>',
          },
          template: {
            dir: `${process.cwd()}/templates/`,
            adapter: new HandlebarsAdapter(), // or new PugAdapter()
            options: {
              strict: true,
            },
          },
        }),
      }),
      ConfigModule.forRoot({
        envFilePath: !process.env.NODE_ENV
          ? '.env'
          : `./env/.env.${process.env.NODE_ENV}`,
      }),
      rootMongooseTestModule(),
      AuthModule,
      forwardRef(() => RentalRequestModule),
      forwardRef(() => UserModule),
      forwardRef(() => LodgeModule),
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
  const rentalRequestService =
    moduleRef.get<RentalRequestService>(RentalRequestService)
  const lodgeService = moduleRef.get<LodgeService>(LodgeService)

  await mocks.adminUser(usersService, authService)
  await mocks.randomUser(authService)
  await mocks.randomLodge(lodgeService, usersService)
  await mocks.randomRentalRequest(rentalRequestService)
})

afterAll(async () => {
  await closeMongooseConnection()
  await App.server.close(() => {
    console.log('Finished all requests')
  })
})
