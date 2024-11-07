import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AuthModule } from './modules/auth/auth.module.js'
import { MissionModule } from './modules/mission/mission.module.js'
import { UserModule } from './modules/user/user.module.js'

@Module({
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
        : `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('DATABASE_URI')
        if (process.env.NODE_ENV === 'test') {
          // This is the extra code,  exclusively for e2e testing
          const mongod = await MongoMemoryServer.create() // <-- in memory mongoDb
          uri = mongod.getUri()
          return { uri } // All that is needed for locally using mongodb-memory-server
        }
        return {
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              console.log(`[Mongoose] ${uri}`)
            }
            connection.on('disconnected', () => {
              console.log(
                '[Mongoose] Disconnected due to application termination'
              )
            })
            connection.on('error', (error: any) => {
              console.log(
                `[Mongoose] Connection has occurred ${error} error`,
                error
              )
            })

            return connection
          },
          // Default for any other envs
          uri,
          // auth: {
          //   username: configService.get<string>('MONGODB_USER'),
          //   password: configService.get<string>('MONGODB_PASSWORD'),
          // },
          // dbName: configService.get<string>('MONGODB_DATABASE'),
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => MissionModule),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
