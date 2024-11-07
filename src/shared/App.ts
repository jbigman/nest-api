import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cors from 'cors'
import jsonServer from 'json-server'
import { Logger } from 'tslog'
import { AppModule } from '../app.module.js'
import { GlobalExceptionFilter } from '../modules/mission/exception/GlobalExceptionFilter.js'

class App {
  public logger
  public server: any

  constructor() {
    this.logger = new Logger({
      minLevel: 2,
      hideLogPositionForProduction: process.env.NODE_ENV === 'production',
    })

    this.logger.info(
      `[ENV] ${process.env.ENVIRONMENT}, ${process.env.NODE_ENV}`
    )
  }

  start = async (): Promise<void> => {
    async function startNestServer(logger: any) {
      logger.info('[Nest start]')
      const server = await NestFactory.create(AppModule)
      server.enableShutdownHooks()

      server.useGlobalFilters(new GlobalExceptionFilter())

      server.use(cors())
      server.use(jsonServer.bodyParser)
      server.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          transformOptions: { enableImplicitConversion: true },
          forbidNonWhitelisted: true,
        })
      )
      // server.use(haltOnTimedout)
      if (process.env.PORT) {
        await server.listen(process.env.PORT)
        logger.info(`[Nest Server] https://localhost:${process.env.PORT}`)
      } else {
        logger.info('[Nest Server] Port: undefined')
      }
      return server
    }
    this.server = await startNestServer(this.logger)
  }

  stop = (): void => {
    this.server?.close()
  }
}

export default new App()
