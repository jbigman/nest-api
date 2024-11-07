import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import type { EMetier } from '../enum/EMetier.js'
import { Mission, type MissionDocument } from '../mission.model.js'
import type { IOrmInterface } from './IMissionOrm.js'

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
  ): Promise<MissionDocument> => {
    const document = await this.missionModel.create({
      metier,
      debut,
      fin,
    })

    return document
  }
}
