import { assert } from 'vitest'
import type { IGetMission } from './../../src/modules/mission/rest-interfaces/IGetMission';

export const isMission = (mission: IGetMission): void => {
  assert.isString(mission.metier)
  assert.isNumber(mission.debut)
  assert.isNumber(mission.fin)
  assert.isString(mission.links.editMission)

}
