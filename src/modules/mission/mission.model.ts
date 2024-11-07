import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type * as mongoose from 'mongoose'
import { mongoosePagination } from 'mongoose-paginate-ts'
import type {  IMission } from './IMission.js'
import { EMetier } from './enum/EMetier.js'

type MissionDocument = mongoose.HydratedDocument<IMission>

@Schema()
class Mission {
  @Prop({
    type: String,
    enum: EMetier,
    default: EMetier.SOIGNANT,
  })
  metier: EMetier
  @Prop()
  debut: number
  @Prop()
  fin: number
}

const MissionSchema = SchemaFactory.createForClass(Mission)
MissionSchema.plugin(mongoosePagination)

export { type MissionDocument, Mission, MissionSchema }
