import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type * as mongoose from 'mongoose'
import { mongoosePagination } from 'mongoose-paginate-ts'
import type { IRentalRequest } from './IRentalRequest.js'

type RentalRequestDocument = mongoose.HydratedDocument<IRentalRequest>

@Schema()
class RentalRequest implements IRentalRequest {
  @Prop()
  firstName: string
  @Prop()
  lastName: string
  @Prop()
  message: string
  @Prop()
  email: string
  @Prop()
  address: string
  @Prop()
  number: number
  @Prop()
  requestDate: number
  @Prop()
  from: number
  @Prop()
  to: number
  @Prop()
  price: number
  @Prop()
  optionsPrice: number
  @Prop()
  taxe: number
  @Prop({ required: false })
  accepted: boolean
  @Prop({ required: false })
  refused: boolean
  @Prop()
  menage: boolean
  @Prop()
  nbLitSimple: number
  @Prop()
  nbLitDouble: number
  @Prop()
  nbLinge: number
  @Prop()
  adults: number
  @Prop()
  kids: number
  @Prop()
  babies: number
  @Prop()
  animals: number
  @Prop({ required: false })
  phone: string
  @Prop()
  paymentStatus: string
  @Prop()
  clientSecret: string
}

const RentalRequestSchema = SchemaFactory.createForClass(RentalRequest)
RentalRequestSchema.plugin(mongoosePagination)

export { type RentalRequestDocument, RentalRequest, RentalRequestSchema }
