import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import type { EMetier } from '../enum/EMetier.js'
import { Mission } from '../mission.model.js'
import type { IOrmInterface } from './IOrmInterface.js'
import type { IMission } from '../IMission.js'

@Injectable()
export class MissionOrm implements IOrmInterface {
  constructor(
    @InjectModel(Mission.name)
    private readonly missionModel: Pagination<Mission>
  ) {}

  createMission = async (
    metier: EMetier,
    debut: number,
    fin: number
  ): Promise<IMission> => {
    const document = await this.missionModel.create({
      metier,
      debut,
      fin,
    })

    return document
  }
}
