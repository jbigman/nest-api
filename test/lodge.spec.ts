import supertest from 'supertest'
import { describe, it, assert } from 'vitest'
import * as routes from '../src/shared/routes.ts'
import * as isValid from './validators/isValid.ts'
import * as mocks from './mocks/mocks.ts'
import type { IGetLodge, IPostDay } from '../src/modules/lodge/IRestLodge.ts'

describe('Test lodge routes', () => {
  it(`GET - ${routes.GET_LODGE}`, async () => {
    const res = await supertest(global.app.getHttpServer()).get(
      routes.GET_LODGE
    )
    const body = res.body
    assert.equal(res.status, 200)
    isValid.isLodge(body)
  })

  it(`EDIT DAY - ${routes.EDIT_LODGE}`, async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    /// CREATE
    const newObject: IPostDay = {
      name: 'lodgename',
      month: 5,
      day: 5,
      disabled: true,
      price: 500,
      year: 2025
    }

    const res = await supertest(global.app.getHttpServer())
      .post(routes.EDIT_LODGE_DAY)
      .send(newObject)
      .set({ Authorization: `Email ${mocks.users.admin.email}` })

    const body: IGetLodge = res.body
    assert.equal(res.status, 201)
    isValid.isLodge(body)
    // TODO Verifier que les donnes sont bien a jour.

    /// assert edit link is available for admin
    assert.isString(body.links.editDay)
    if (body.links.editDay == null) {
      return false
    }

    const editAgainRes = await supertest(global.app.getHttpServer())
      .post(body.links.editDay)
      .send(newObject)
      .set({ Authorization: `Email ${mocks.users.admin.email}` })
    assert.equal(editAgainRes.status, 201)
    isValid.isLodge(body)
    // TODO Verifier que les donnes sont bien a jour.
  })
})
