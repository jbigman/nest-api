import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import * as routes from '../../shared/routes.js'
import { AuthService } from '../auth/auth.service.js'
import type { UserDocument } from '../user/user.model.js'
import type { ILodge } from './ILodge.js'
import type {
  IGetLodge,
  IGetPrice,
  IPostDay,
  IPostLodge,
  IPostNewLodge,
} from './IRestLodge.js'
import { defaultCalendar } from './defaultCalendar.js'
import { Lodge, type LodgeDocument } from './lodge.model.js'

@Injectable()
export class LodgeService {
  constructor(
    @InjectModel(Lodge.name)
    private readonly LodgeModel: Pagination<LodgeDocument>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  getLodge = async (token: string, name?: string) => {
    const requester: any = await this.authService.getUser(token)
    const document = name
      ? await this.LodgeModel.findOne({ name: name })
      : await this.LodgeModel.findOne()

    if (document) {
      return this.LodgeToRestLodge(document, requester)
    }

    return new NotFoundException()
  }

  getPrice = async (body: IGetPrice) => {
    const dayInMs = 24 * 60 * 60 * 1000

    // calculate options price according to options
    const menagePrice = body.options.menage ? 100 : 0
    const litSimplePrice =
      (body.options.nbLitSimple ? body.options.nbLitSimple : 0) * 10
    const litDoublePrice =
      (body.options.nbLitDouble ? body.options.nbLitDouble : 0) * 10
    const lingePrice = (body.options.nbLinge ? body.options.nbLinge : 0) * 10
    const optionPrice =
      menagePrice + litSimplePrice + litDoublePrice + lingePrice

    // Calcultate taxes according to number of travelers and number of nights
    let taxePrice = 0
    if (body.to && body.from) {
      const nbNights = (body.to - body.from) / dayInMs
      taxePrice =
        (body.options.adults ? body.options.adults : 0) * nbNights * 0.9
    }

    const document = body.name
      ? await this.LodgeModel.findOne({ name: name })
      : await this.LodgeModel.findOne()

    if (!document) {
      return {
        error: 'Calcul impossible',
        options: optionPrice,
        taxes: taxePrice,
      }
    }

    if (!body.from) {
      return {
        error: 'Missing start date',
        options: optionPrice,
        taxes: taxePrice,
      }
    }

    if (!body.to) {
      return {
        error: 'Missing end date',
        options: optionPrice,
        taxes: taxePrice,
      }
    }

    const start = new Date(body.from)
    const end = new Date(body.to)

    const time = end.getTime() - start.getTime()

    for (const vac of document.params.holidays) {
      if (
        (vac.start < start.getTime() && start.getTime() < vac.end) ||
        (vac.start < end.getTime() && end.getTime() < vac.end)
      ) {
        if (start.getDay() !== 6 || end.getDay() !== 6) {
          return {
            error: 'Merci de selectionner un séjour du samedi au samedi',
            options: optionPrice,
            taxes: taxePrice,
          }
        }
      } else {
        // Verify the 2 nigths rule
        if (time < 2 * dayInMs) {
          return {
            error: 'Merci de selectionner au moins 2 nuits',
            options: optionPrice,
            taxes: taxePrice,
          }
        }
      }
    }

    // Const calculate night price according to dates
    let rangePrice = 0
    console.log('-----')
    console.log(start)
    for (const day of document.calendar) {
      const dayAsMs = new Date(day.year, day.month - 1, day.day).getTime()

      const hour = 60 * 60 * 1000
      if (
        start.getTime() - 6 * hour <= dayAsMs &&
        dayAsMs < end.getTime() - 6 * hour
      ) {
        console.log(new Date(day.year, day.month - 1, day.day))
        if (day.disabled) {
          return {
            error: 'Jours non disponible dans la selection',
            options: optionPrice,
            taxes: taxePrice,
          }
        }
        rangePrice += day.price
      }
    }
    console.log(rangePrice)
    console.log(end)

    return {
      nights: rangePrice,
      options: optionPrice,
      taxes: taxePrice,
    }
  }

  createLodgeInternal = async (
    body: IPostNewLodge,
    requester: UserDocument
  ) => {
    const document = await this.LodgeModel.findOne({ name: body.name })

    if (!requester) {
      return new UnauthorizedException()
    }

    if (document) {
      return new ConflictException('A lodge with this name already exists')
    }

    // Else, create a new lodge entry
    const newLodge: ILodge = {
      name: body.name,
      description: body.description,
      address: body.address,
      admins: [requester.email],
      calendar: defaultCalendar,
      params: {
        arrivalTime: 0,
        departureTime: 0,
        nbDouble: 5,
        nbSimple: 1,
        prixDraps: 10,
        prixLinges: 8,
        maxDate: new Date(2026, 1, 15).getTime(),
        holidays: [],
      },
    }

    const createdLodge = await this.LodgeModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...newLodge,
    })
    return this.LodgeToRestLodge(createdLodge, requester)
  }

  createLodge = async (body: IPostNewLodge, token: string) => {
    const requester = await this.authService.getUser(token)
    if (!requester) return new UnauthorizedException()
    return this.createLodgeInternal(body, requester)
  }

  disableDays = async (name: string, from: number, to: number) => {
    const existingLodge = await this.LodgeModel.findOne({
      name,
    })

    if (!existingLodge) return

    const start = new Date(from)
    const end = new Date(to)

    let process = false
    //Search firstday and apply disabled = true until last day is found
    for (const day of existingLodge.calendar) {
      // Found first day, start disabling days
      if (
        day.year === start.getFullYear() &&
        day.month - 1 === start.getMonth() &&
        day.day === start.getDate()
      ) {
        process = true
      }

      if (process) {
        day.disabled = true
      }

      // Found last day, stop disabling days
      if (
        day.year === end.getFullYear() &&
        day.month - 1 === end.getMonth() &&
        day.day + 1 === end.getDate()
      ) {
        process = false
      }
    }

    const updatedLodge = await this.LodgeModel.findOneAndUpdate(
      { name },
      existingLodge
    )
  }

  editLodge = async (body: IPostLodge, token?: string) => {
    const existingLodge = await this.LodgeModel.findOne({
      name: 'test3',
    })

    if (!existingLodge) {
      return new NotFoundException()
    }

    // Override params if updated
    // existingLodge.params.prixDraps = body.nbLitsDouble
    //   ? body.nbLitsDouble
    //   : existingLodge.params.nbDouble
    // existingLodge.params.nbSimple = body.nbLitsSimple
    //   ? body.nbLitsSimple
    //   : existingLodge.params.nbSimple
    // existingLodge.params.prixDraps = body.prixDraps
    //   ? body.prixDraps
    //   : existingLodge.params.prixDraps

    // existingLodge.params.prixLinges = body.prixLinges
    //   ? body.prixLinges * 1
    //   : existingLodge.params.prixLinges

    if(body.maxDate)
      existingLodge.params.maxDate = Number.parseInt(body.maxDate)
    
    if(body.holidays)
      existingLodge.params.holidays = body.holidays

    console.log(existingLodge.params.maxDate, new Date(existingLodge.params.maxDate).toDateString())

    const updatedLodge = await this.LodgeModel.findOneAndUpdate(
      { name: existingLodge.name },
      existingLodge
    )

    if (!updatedLodge) {
      return new HttpException('Something went wrong, not updated', 500)
    }
    console.log(updatedLodge.params.maxDate, new Date(updatedLodge.params.maxDate).toDateString())

    return await this.LodgeToRestLodge(
      updatedLodge,
      token ? await this.authService.getUser(token) : null
    )
  }

  editLodgeDay = async (body: IPostDay, token?: string) => {
    if (!token) return

    let user = await this.authService.getUser(token)
    if (!user) {
      const payload = await this.authService.extractPayload(token)
      if (!payload) {
        console.log('no payload')
        return // error ?
      }
      user = await this.authService.create({
        email: payload.email as string,
        name: payload.name as string,
        avatar: payload.picture as string,
        isAdmin: false,
      })
    }
    const lodge = await this.LodgeModel.findOne({ name: body.name })
    if (!lodge) {
      return new HttpException(
        'Something went wrong, should not happen - not found',
        500
      )
    }

    if (!user.isAdmin) {
      console.log('not admin')
      return await this.LodgeToRestLodge(lodge, user)
    }
    let found = false
    for (const day of lodge.calendar) {
      if (day.day === body.day && day.month === body.month && day.year === body.year) {
        day.disabled = body.disabled
        day.price = body.price
        found = true
      }
    }

    // If not found add new day to calendar
    if (!found) {
      lodge.calendar.push({
        year: body.year,
        month: body.month,
        day: body.day,
        disabled: body.disabled,
        price: body.price,
      })
    }

    const editedLodge = await this.LodgeModel.findOneAndUpdate(
      { name: body.name },
      lodge,
      { new: true }
    )
    if (!editedLodge) {
      return new HttpException(
        'Something went wrong, should not happen - 2',
        500
      )
    }

    return await this.LodgeToRestLodge(editedLodge, user)
  }

  saveLodge = async (doc: LodgeDocument) => {
    const updated = await this.LodgeModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(doc._id) },
      doc
    )
    if (!updated) {
      console.log('not found')
    }

    return updated
  }

  LodgeToRestLodge = async (
    lodge: LodgeDocument,
    requester: null | UserDocument,
    language = 'en',
    country = 'US'
  ): Promise<IGetLodge> => {
    const restLodge: IGetLodge = {
      name: lodge.name,
      description: lodge.description,
      address: lodge.address,
      admins: [],
      calendar: lodge.calendar,
      maxDate: lodge.params.maxDate,
      holidays: lodge.params.holidays,
      links: {},
    }

    if (requester?.isAdmin) {
      restLodge.links.editDay = routes.EDIT_LODGE_DAY
      restLodge.links.editLodge = routes.EDIT_LODGE

    }
    return restLodge
  }
}
