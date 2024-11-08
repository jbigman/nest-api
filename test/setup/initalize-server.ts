import { afterAll, beforeAll, vi } from 'vitest'
import App from '../../src/shared/App'
import * as mocks from '../mocks/mocks'
import { Test } from '@nestjs/testing'
import { AuthService } from '../../src/modules/auth/auth.service.ts'
import { ValidationPipe } from '@nestjs/common'
import { closeMongooseConnection } from './MongooseTestModule.ts'
import { UserService } from '../../src/modules/user/user.service.ts'
import { MissionDbTestService } from '../mocks/mission.db.test.service.ts'
import { AppModule } from '../../src/app.module.ts'
import { GlobalExceptionFilter } from '../../src/shared/GlobalExceptionFilter.ts'
import { ORM_INTERFACE_TOKEN } from '../../src/tokens/orm-token.ts'

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      AppModule,
    ],
  })
  .overrideProvider(ORM_INTERFACE_TOKEN)
  .useClass(MissionDbTestService)             
  .compile()
  
  // Ovveride OAut before createNestApplication 
  vi.mock('google-auth-library', () => {
    return {
      OAuth2Client: vi.fn().mockImplementation(() => ({
        verifyIdToken: vi.fn().mockImplementation(({ idToken }) => {
          if (idToken === 'testValidToken') {
            return Promise.resolve({
              getPayload: () => ({
                sub: '1234567890',  // Mocked Google user ID
                email: 'testuser@example.com',
                name: 'Test User',
                picture: 'http://example.com/photo.jpg',
              }),
            });
          }
          if (idToken === 'testInvalidToken') {
            return Promise.reject(new Error('Invalid token'));
          } 
          
          return Promise.reject(new Error('Unknown token'));
          
        }),
      })),
    };
  });
  
  const app = moduleRef.createNestApplication()
  
  // Intercept errors to return http exceptions.
  app.useGlobalFilters(new GlobalExceptionFilter())
  
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
