import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import App from '../../src/shared/App'

const mongod = new MongoMemoryServer()

/**
 * Connect to the in-memory database.
 */
export const connect = async () => {
  await mongod.start()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
  App.logger.info('[Mongoose] Memory server started')
}

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
  // await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}

export default { connect, closeDatabase, clearDatabase }
