import supertest from 'supertest'
import { describe, it, assert } from 'vitest'
import * as isValid from './validators/isValid.ts'
import * as mocks from './mocks/mocks.ts'
import type { IRestPostMission } from '../src/modules/mission/rest-interfaces/IRestPostMission.ts';
import { EMetier } from '../src/modules/mission/enum/EMetier.ts'

describe('Test mission routes', () => {
  it('CREATE', async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    const body : IRestPostMission = {
      debut: 123,
      fin: 124,
      metier: EMetier.INFIRMER
    }
    const res = await supertest(global.app.getHttpServer()).post( '/mission/create')
    .send(body)
    .set({ Authorization: `Email ${mocks.users.admin.email}` })
    const responseBody = res.body
    assert.equal(res.status, 200)
    isValid.isMission(responseBody)
  })
  
  it('GET', async () => {
    const res = await supertest(global.app.getHttpServer()).get('/mission')
    const responseBody = res.body
    assert.equal(res.status, 200)
    isValid.isMission(responseBody)
  })
  
})
