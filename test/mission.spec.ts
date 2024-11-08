import supertest from 'supertest'
import { describe, it, assert } from 'vitest'
import { isMission } from './validators/isMission.ts'
import type { IRestPostMission } from '../src/modules/mission/rest-interfaces/IRestPostMission.ts';
import { EMetier } from '../src/modules/mission/enum/EMetier.ts'
import { users } from './mocks/mocks.ts';

describe('Test mission routes', () => {
  it('CREATE', async () => {
    if (!users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    const body : IRestPostMission = {
      debut: new Date().getTime(),
      fin: new Date().getTime() + 1000*60, // +1min
      metier: EMetier.INFIRMER
    }
    const res = await supertest(global.app.getHttpServer())
    .post( '/mission/create')
    .send(body)
    .set({ Authorization: `Email ${users.admin.email}` })
    const responseBody = res.body
    assert.equal(res.status, 201)
    isMission(responseBody)
  })

  it('CREATE with incorrect dates', async () => {
    if (!users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    const body : IRestPostMission = {
      debut: new Date().getTime(),
      fin: new Date().getTime() - 1000*60, // -1min
      metier: EMetier.INFIRMER
    }
    const res = await supertest(global.app.getHttpServer())
    .post( '/mission/create')
    .send(body)
    .set({ Authorization: `Email ${users.admin.email}` })
    assert.equal(res.status, 400)
    assert.equal(res.body.message, 'date de debut doit être anterieur à la date de fin')
  })
})
