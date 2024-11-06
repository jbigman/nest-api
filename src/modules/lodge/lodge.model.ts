import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type * as mongoose from 'mongoose'
import { mongoosePagination } from 'mongoose-paginate-ts'
import type { ILodge } from './ILodge.js'

type LodgeDocument = mongoose.HydratedDocument<ILodge>

@Schema({ _id: false })
class Day {
  @Prop()
  year: number
  @Prop()
  month: number
  @Prop()
  day: number
  @Prop()
  price: number
  @Prop({ required: false })
  disabled: boolean
}

const DaySchema = SchemaFactory.createForClass(Day)

@Schema({ _id: false })
class LodgeParams {
  @Prop()
  arrivalTime: number
  @Prop()
  departureTime: number
  @Prop()
  prixDraps: number
  @Prop()
  nbDouble: number
  @Prop()
  nbSimple: number
  @Prop()
  prixLinges: number  
  @Prop()
  holidays: holiday[]
  @Prop()
  maxDate: number
}

@Schema({ _id: false })
class holiday {
  @Prop()
  start: number 
  @Prop()
  end:number
}

@Schema()
class Lodge {
  @Prop()
  name: string
  @Prop()
  description: string
  @Prop()
  address: string
  @Prop()
  admins: string[]
  @Prop({ type: [DaySchema], _id: false, default: [] })
  calendar: Day[]

  @Prop()
  params: LodgeParams
}

const LodgeSchema = SchemaFactory.createForClass(Lodge)
LodgeSchema.plugin(mongoosePagination)

export { type LodgeDocument, Lodge, LodgeSchema }
