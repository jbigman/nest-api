import supertest from 'supertest'
import { describe, it, assert } from 'vitest'
import * as mocks from './mocks/mocks.js'
import * as routes from '../src/shared/routes.js'

describe('Test auth routes', () => {
  it(`POST - ${routes.AUTHENTICATE}`, async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    const token =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjMGI2OTEzZmUxMzgyMGEzMzMzOTlhY2U0MjZlNzA1MzVhOWEwYmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4Nzg5ODg3OTU5MzgtNGhzcHZqbHFqbjFha3B1ODQ2NjNiMmxraTIwZDIwYmQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4Nzg5ODg3OTU5MzgtNGhzcHZqbHFqbjFha3B1ODQ2NjNiMmxraTIwZDIwYmQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDI1NjYwMzc4NTEzODQ5ODM5NTQiLCJlbWFpbCI6InRoZWFuZ2VsZmlzdC5nYW1pbmdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJTYnFwNllHMExxc1pvTXhfRlhVYlJnIiwibmFtZSI6IkrDqXLDqW1pZSBQaGlsaXBwZSDigJxUQUbigJ0gR0FNQklOIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0p3ZEtzUUpNSzFBOFIybFk2Z3E1eE9XZjJseVZkblRpdzZkTE0ta05GLT1zOTYtYyIsImdpdmVuX25hbWUiOiJKw6lyw6ltaWUgUGhpbGlwcGUiLCJmYW1pbHlfbmFtZSI6IkdBTUJJTiIsImxvY2FsZSI6ImZyIiwiaWF0IjoxNjk1MjE2Njk5LCJleHAiOjE2OTUyMjAyOTl9.GPoyUzp5ORbRpmikG6awl2pEBzJc-qQAG16DZM3OaxD1Xzd71wqsAjE-3bd-yYOA0cM0bi1S0QTGYwwkjjDxfJ13wAIjEgHaifOFV6TuGPp1BmwmJQ_vKyIDhKUjX1Of4FfUANwBErcnEAVTrNXcGu16x4c461X48Vg3MYKWWJu3lGPgMpmLPoyIFm11vEX5vu7dH9Ssu5dcGFxArqmLN9tOI7gUWEuGhlBomc1tMkwe3Pm871xsr4B0Pj7YFey2dXFKGDJhijsTvJARezdJsXOrI83VsInA5bQIwcc3dYXvPq-J6EtlJSRo25hC2aSTel5DYckJhd0gvSRHCnAWYg'

    const res = await supertest(global.app.getHttpServer())
      .post(routes.AUTHENTICATE)
      .send({ token })

    assert.equal(res.status, 201)
  })

  it(`POST no token - ${routes.AUTHENTICATE}`, async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }

    const res = await supertest(global.app.getHttpServer()).post(
      routes.AUTHENTICATE
    )

    assert.equal(res.body.response.statusCode, 401)
  })

  it(`POST invalid token - ${routes.AUTHENTICATE}`, async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }

    const res = await supertest(global.app.getHttpServer())
      .post(routes.AUTHENTICATE)
      .send({ token: 'invalid-token' })

    assert.equal(res.body.response.statusCode, 401)
  })
})
