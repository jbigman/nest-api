import supertest from 'supertest'
import { describe, it, assert } from 'vitest'
import * as routes from '../src/shared/routes.ts'
import * as isValid from './validators/isValid.ts'
import * as mocks from './mocks/mocks.ts'
import type { IGetRentalRequest } from '../src/modules/rental-request/IRestRentalRequest.ts'
import type { IPostNewRentalRequest } from '../src/modules/rental-request/IRentalRequest.ts'

describe('Test rental request routes', () => {
  it(`GET - ${routes.GET_RENTAL_REQUESTS}`, async () => {
    const res = await supertest(global.app.getHttpServer()).get(
      routes.GET_RENTAL_REQUESTS
    )
    const body = res.body
    assert.equal(res.status, 200)
    assert.isArray(body.docs)
    for (const element of body.docs as IGetRentalRequest[]) {
      isValid.rentalRequest(element)
    }
  })

  // it(`CREATE, CONTROL and DELETE - ${routes.CREATE_RENTAL_REQUEST}`, async () => {
  //   if (!mocks.users.admin) {
  //     throw new Error('TEST - Admin not yet created?')
  //   }
  //   /// CREATE
  //   const newObject: IPostNewRentalRequest = {
  //     from: 1715775338783,
  //     to: 1715775338783,
  //     price: 100,
  //     taxe: 10,
  //     total: 200,
  //     options: {
  //       menage: false,
  //       nbLitSimple: 1,
  //       nbLitDouble: 1,
  //       nbLinge: 1,
  //       adults: 1,
  //       kids: 1,
  //       babies: 1,
  //       animals: 1,
  //     },
  //   }

  //   const res = await supertest(global.app.getHttpServer())
  //     .post(routes.CREATE_RENTAL_REQUEST)
  //     .send(newObject)
  //     .set({ Authorization: `Email ${mocks.users.admin.email}` })

  //   const body: { rentalRequest: IGetRentalRequest; clientSecret: string } =
  //     res.body
  //   assert.equal(res.status, 201)
  //   isValid.rentalRequest(body.rentalRequest)

  //   /// DELETE
  //   assert.isString(body.rentalRequest.links.delete)
  //   if (body.rentalRequest.links.delete == null) {
  //     return false
  //   }

  //   // console.log('delete link', body.rentalRequest.links.delete)
  //   const deleteRes = await supertest(global.app.getHttpServer())
  //     .delete(body.rentalRequest.links.delete)
  //     .set({ Authorization: `Email ${mocks.users.admin.email}` })
  //   assert.equal(deleteRes.status, 200)
  // })

  it(`DELETE 401 - ${routes.DELETE_RENTAL_REQUEST}`, async () => {
    const fakeId = '41224d776a326fb40f000001'
    const res = await supertest(global.app.getHttpServer()).delete(
      routes.DELETE_RENTAL_REQUEST.replace(':rentalRequestId', fakeId)
    )

    assert.equal(res.status, 200)
    assert.equal(res.body.response.statusCode, 401)
  })

  it(`DELETE 404 - ${routes.DELETE_RENTAL_REQUEST}`, async () => {
    if (!mocks.users.admin) {
      throw new Error('TEST - Admin not yet created?')
    }
    const fakeId = '41224d776a326fb40f000001'
    const res = await supertest(global.app.getHttpServer())
      .delete(routes.DELETE_RENTAL_REQUEST.replace(':rentalRequestId', fakeId))
      .set({ Authorization: `Email ${mocks.users.admin.email}` })
    assert.equal(res.body.response.statusCode, 404)
  })
})
