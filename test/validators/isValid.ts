import { assert } from 'vitest'
import type IRestUser from '../../src/modules/user/IRestUser.ts'
import type { IGetRentalRequest } from '../../src/modules/rental-request/IRestRentalRequest.ts'
import type { IGetLodge } from '../../src/modules/lodge/IRestLodge.ts'
import type { ICalendar } from '../../src/modules/lodge/ILodge.ts'

export const rentalRequest = (request: IGetRentalRequest): void => {
  console.log('isValid request', JSON.stringify(request))
  assert.isString(request.message)
}
export const isLodge = (lodge: IGetLodge): void => {
  assert.isString(lodge.name)
  assert.isString(lodge.description)
  assert.isString(lodge.address)
  assert.isArray(lodge.admins)
}
export const isCalendar = (calendar: ICalendar): void => {
  assert.isNumber(calendar.year)
  assert.isArray(calendar.days)
}

export const user = (user: IRestUser): void => {
  assert.isString(user.email)
  assert.isString(user.avatar)
  assert.isString(user.id)
  assert.isString(user.name)
}
