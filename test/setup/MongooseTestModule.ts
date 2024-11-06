import { MongooseModule, type MongooseModuleOptions } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: MongoMemoryServer

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongo = await MongoMemoryServer.create()
      const mongoUri = mongo.getUri()
      return {
        uri: mongoUri,
        ...options,
      }
    },
  })

export const closeMongooseConnection = async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}
