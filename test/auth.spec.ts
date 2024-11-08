import supertest from 'supertest'
import { describe, it, assert, vi, beforeAll } from 'vitest'
import { users } from './mocks/mocks.ts'

describe('Test auth routes', () => {
  
const authRoute = '/users/auth' 

it(`POST valid - ${authRoute}`, async () => {
  if (!users.admin) {
    throw new Error('TEST - Admin not yet created?')
  }
  const res = await supertest(global.app.getHttpServer())
  .post(authRoute)
  .send({ token: 'testValidToken' })
  
  assert.equal(res.status, 201)
})

it(`POST without token - ${authRoute}`, async () => {
  if (!users.admin) {
    throw new Error('TEST - Admin not yet created?')
  }
  
  const res = await supertest(global.app.getHttpServer())
  .post(authRoute)
  
  assert.equal(res.status, 401)
})

it(`POST with invalid token - ${authRoute}`, async () => {
  if (!users.admin) {
    throw new Error('TEST - Admin not yet created?')
  }
  
  const res = await supertest(global.app.getHttpServer())
  .post(authRoute)
  .send({ token: 'testInvalidToken' })
  
  assert.equal(res.status, 401)
})
})
