import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import { mongoosePagination } from 'mongoose-paginate-ts'
import type IUser from './IUser.js'

export type UserDocument = HydratedDocument<IUser> & {
  _id: string
}

@Schema()
class User {
  constructor(user: IUser) {
    this.email = user.email
    this.avatar = user.avatar
    this.name = user.name
    this.isAdmin = user.isAdmin
  }
  @Prop({ required: true })
  email: string

  @Prop({ default: '' })
  avatar: string

  @Prop({ required: true })
  name: string
  @Prop({ required: true })
  isAdmin: boolean
}

const UserSchema = SchemaFactory.createForClass(User)
UserSchema.plugin(mongoosePagination)

export { User, UserSchema }
