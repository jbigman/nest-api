import { MailerService } from '@nestjs-modules/mailer'
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'bson'
import mongoose from 'mongoose'
import type { Pagination } from 'mongoose-paginate-ts'
import Stripe from 'stripe'
import { transformCollection } from '../../shared/Helper.js'
import * as routes from '../../shared/routes.js'
import { AuthService, isAdmin } from '../auth/auth.service.js'
import { LodgeService } from '../lodge/lodge.service.js'
import type { UserDocument } from '../user/user.model.js'
import type { IPostNewRentalRequest, IRentalRequest } from './IRentalRequest.js'
import type {
  IGetRentalRequest,
  IPostQuestion,
  IPostRentalRequestBilling,
} from './IRestRentalRequest.js'
import {
  RentalRequest,
  type RentalRequestDocument,
} from './rental-request.model.js'

@Injectable()
export class RentalRequestService {
  stripe

  constructor(
    @InjectModel(RentalRequest.name)
    private readonly rentalRequestModel: Pagination<RentalRequestDocument>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => MailerService))
    private readonly mailerService: MailerService,

    @Inject(forwardRef(() => LodgeService))
    private readonly lodgeService: LodgeService,

    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService<IEnvironmentVariables>
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY')
    if (!secretKey) {
      console.log(
        this.configService.get<string>('NODE_ENV'),
        'Missing stripe secret key'
      )
      throw new Error(
        `Missing stripe secret key${this.configService.get<string>('NODE_ENV')}`
      )
    }
    this.stripe = new Stripe(secretKey)
  }

  getRentalRequests = async (token: string) => {
    const requester = await this.authService.getUser(token)
    const documents = await this.rentalRequestModel.paginate({ limit: 5000, sort: {requestDate: -1} })
    console.log(`Found ${documents ? documents.totalDocs : 0} RentalRequests`)
    const restRentalRequests = await transformCollection<
      RentalRequestDocument,
      IGetRentalRequest
    >(documents, this.RentalRequestToRestRentalRequest, requester)
    return restRentalRequests
  }

  getRentalRequestByClientSecret = async (clientSecret: string) => {
    const rentalRequest = await this.rentalRequestModel.findOne({
      clientSecret,
    })

    if (!rentalRequest) {
      return new NotFoundException()
    }

    if (rentalRequest.paymentStatus === 'undefined') {
      // check if we can update it.
      // this.stripe.paymentIntents.search()
    }
    return await this.RentalRequestToRestRentalRequest(rentalRequest, null)
  }

  createRentalRequestAndPaymentIntent = async (
    body: IPostNewRentalRequest,
    token?: string
  ) => {
    // Const calculate night price according to dates and options
    const priceResult = await this.lodgeService.getPrice({
      from: body.from,
      to: body.to,
      options: {
        menage: body.options.menage,
        nbLitSimple: body.options.nbLitSimple,
        nbLitDouble: body.options.nbLitDouble,
        nbLinge: body.options.nbLinge,
        adults: body.options.adults,
        kids: body.options.kids,
        babies: body.options.babies,
        animals: body.options.animals,
      },
    })

    if (priceResult.error) {
      return new BadRequestException(priceResult.error)
    }

    if (!priceResult.nights) {
      return new BadRequestException(priceResult.error)
    }

    const document: IRentalRequest = {
      message: 'empty',
      lastName: 'empty',
      firstName: 'empty',
      phone: 'empty',
      email: 'empty',
      address: 'empty',
      from: body.from,
      to: body.to,
      adults: body.options.adults,
      kids: body.options.kids,
      babies: body.options.babies,
      animals: body.options.animals,
      price: priceResult.nights,
      optionsPrice: priceResult.options,
      taxe: priceResult.taxes,
      menage: body.options.menage,
      nbLinge: body.options.nbLinge,
      nbLitSimple: body.options.nbLitSimple,
      nbLitDouble: body.options.nbLitDouble,
      paymentStatus: 'undefined',
      clientSecret: 'clientSecret',
      requestDate: Date.now(),
    }

    const createdRentalRequest = await this.rentalRequestModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...document,
    })

    if (!createdRentalRequest) {
      return new HttpException('Something went wrong, should not hAppen', 500)
    }

    const restRentalRequest = await this.RentalRequestToRestRentalRequest(
      createdRentalRequest,
      token ? await this.authService.getUser(token) : null
    )
    // Create a PaymentIntent with the order amount and currency
    console.log(process.env.STRIPE_SECRET_KEY)
    console.log(process.env.STRIPE_PUBLISHABLE_KEY)

    const totalPrice = 100 * createdRentalRequest.price + 100 * createdRentalRequest.taxe + 100 * createdRentalRequest.optionsPrice

    const arrhes = createdRentalRequest.from - new Date().getTime() > 30*60*60*25*1000 ?  totalPrice * 30 / 100 : totalPrice
    const paymentIntent = await this.stripe.paymentIntents.create({
      //receipt_email: createdRentalRequest.email,
      metadata: {
        // we will use this order id to update the order when webhook called
        orderId: createdRentalRequest.id,
      },
      amount: arrhes,
      currency: 'eur',
      // payment_method: 'card',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // add clientSecret to the request
    const rentalRequest = await this.rentalRequestModel.findOneAndUpdate(
      { _id: createdRentalRequest._id },
      { $set: { clientSecret: paymentIntent.client_secret } },
      { new: true }
    )

    return {
      rentalRequest: restRentalRequest,
      clientSecret: paymentIntent.client_secret,
    }
  }

  stripeWebhook = async (event: Stripe.Event) => {
    console.log('Nouveau webhook stripe', JSON.stringify(event))
    const type = event.type.toString()

    switch (type) {
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          console.log('paymentIntent succeeded', JSON.stringify(paymentIntent))

          // Mettre à jour la request qui correspond.
          const _id = paymentIntent.metadata.orderId
          const rentalRequest = await this.rentalRequestModel.findOneAndUpdate(
            { _id },
            {
              $set: {
                paymentStatus: paymentIntent.status,
                email: paymentIntent.receipt_email,
              },
            },
            { new: true }
          )

          console.log('request updated', JSON.stringify(rentalRequest))
          if (!rentalRequest) {
            // Error
            break
          }
          this.sendConfirmation('La petite Pouzerie', rentalRequest)

          //Lock days
          this.lodgeService.disableDays(
            'test3',
            rentalRequest.from,
            rentalRequest.to
          )
        }
        break
      //case 'payment_intent.created':
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    return { received: true }
  }

  addCustomerInformation = async (
    clientSecret: string,
    data: IPostRentalRequestBilling,
    token?: string
  ) => {
    console.log('addCustomerInformation', 'received', clientSecret, data)

    const partialData: Partial<IRentalRequest> = {
      email: data.custom.email,
      phone: data.billing.phone,
      message: data.custom.message,
      firstName: data.billing.firstName,
      lastName: data.billing.lastName,
      address: `${data.billing.address.line1} ${data.billing.address.city} ${data.billing.address.postal_code} ${data.billing.address.country}`,
    }
    // add clientSecret to the request
    const rentalRequest = await this.rentalRequestModel.findOneAndUpdate(
      { clientSecret: clientSecret },
      { $set: partialData },
      { new: true }
    )
    if (!rentalRequest) {
      console.log('addCustomerInformation', 'notfound')
      return new NotFoundException()
    }

    const restRentalRequest = await this.RentalRequestToRestRentalRequest(
      rentalRequest,
      token ? await this.authService.getUser(token) : null
    )
    console.log('addCustomerInformation', restRentalRequest)
    return {
      rentalRequest: restRentalRequest,
      clientSecret: rentalRequest.clientSecret,
    }
  }

  sendConfirmation = (lodgeName: string, body: RentalRequestDocument) => {
    this.mailerService
      .sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_CONTACT,
        subject: `[${lodgeName}] Confirmation réservation du 
        ${new Date(body.from).toLocaleDateString('FR')} au 
        ${new Date(body.to).toLocaleDateString('FR')}`,
        template: 'resa-confirm-host',
        context: {
          lodgeName: lodgeName,
          from: new Date(body.from).toLocaleDateString('FR'),
          to: new Date(body.to).toLocaleDateString('FR'),

          price: body.price,
          taxe: body.taxe,
          optionsPrice: body.optionsPrice,
          total: body.price + body.taxe + body.optionsPrice,

          menage: body.menage ? 'Oui' : 'Non',
          nbLitSimple: body.nbLitSimple,
          nbLitDouble: body.nbLitDouble,
          nbLinge: body.nbLinge,

          adults: body.adults,
          kids: body.kids,
          babies: body.babies,
          animals: body.animals,

          message: body.message ? body.message : '',

          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          address: body.address,
        },
      })
      .then((success: any) => {
        console.log(success)
      })
      .catch((err: any) => {
        console.log(err)
      })

    // Envoit de la confirmation au voyageur.
    this.mailerService
      .sendMail({
        from: process.env.SMTP_USER,
        to: body.email,
        subject: `[${lodgeName}] Confirmation réservation du 
        ${new Date(body.from).toLocaleDateString('FR')} au 
        ${new Date(body.to).toLocaleDateString('FR')}`,
        template: 'resa-confirm-traveler',
        context: {
          lodgeName: lodgeName,
          firstName: body.firstName,
          lastName: body.lastName,
          message: body.message ? body.message : '',
          from: new Date(body.from).toLocaleDateString('FR'),
          to: new Date(body.to).toLocaleDateString('FR'),

          price: body.price,
          taxe: body.taxe,
          optionsPrice: body.optionsPrice,
          total: body.price + body.taxe + body.optionsPrice,

          menage: body.menage ? 'Oui' : 'Non',
          nbLitSimple: body.nbLitSimple,
          nbLitDouble: body.nbLitDouble,
          nbLinge: body.nbLinge,

          adults: body.adults,
          kids: body.kids,
          babies: body.babies,
          animals: body.animals,

          hostPhone: '0615763309',
          hostMail: 'philippegambin@gmail.com',
          signature: 'Philippe et Marie-Claude GAMBIN.',
        },
      })
      .then((success: any) => {
        console.log(success)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  createQuestion = async (body: IPostQuestion) => {
    console.log('Nouveau Message', JSON.stringify(body))
    const lodgeName = 'La pouzerie'
    this.mailerService
      .sendMail({
        from: process.env.SMTP_USER, // sender address
        to: body.email, // list of receivers
        subject: `[${lodgeName}] Demande d'information de la part de ${body.firstName} ${body.lastName}`,
        template: 'contact-mail-traveler',
        context: {
          lodgeName: lodgeName,
          firstName: body.firstName,
          lastName: body.lastName,
          message: body.message,
        },
      })
      .then((success: any) => {
        console.log(success)
      })
      .catch((err: any) => {
        console.log(err)
      })

    this.mailerService
      .sendMail({
        from: process.env.SMTP_USER, // sender address
        to: process.env.SMTP_CONTACT, // list of receivers
        subject: `[${lodgeName}] Demande d'information de la part de ${body.firstName} ${body.lastName}`,
        template: 'contact-mail-host',
        context: {
          lodgeName: lodgeName,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          message: body.message,
        },
      })
      .then((success: any) => {
        console.log(success)
      })
      .catch((err: any) => {
        console.log(err)
      })

    return body
  }

  deleteRentalRequest = async (rentalRequestId: string, token: string) => {
    console.log(`try delete ${rentalRequestId}`)
    const user = await this.authService.getUser(token)
    if (!user || !isAdmin(user)) {
      return new UnauthorizedException()
    }

    const rr = await this.rentalRequestModel.find()
    console.log('RR in DB', JSON.stringify(rr))

    const RentalRequestToDelete = await this.rentalRequestModel.findOne({
      _id: new ObjectId(rentalRequestId),
    })

    if (!RentalRequestToDelete) {
      console.log(`not found ${rentalRequestId}`)
      return new NotFoundException()
    }

    // Delete the RentalRequest
    const deletionResult = await this.rentalRequestModel.deleteOne({
      _id: new ObjectId(rentalRequestId),
    })

    return { deletionResult }
  }

  saveRentalRequest = async (doc: RentalRequestDocument) => {
    const updated = await this.rentalRequestModel.findOneAndUpdate(
      { _id: doc._id },
      doc
    )
    if (!updated) {
      console.log('not found')
    }

    return updated
  }

  RentalRequestToRestRentalRequest = async (
    rentalRequest: RentalRequestDocument,
    requester: null | UserDocument,
    language = 'en',
    country = 'US'
  ): Promise<IGetRentalRequest> => {
    const restRentalRequest: IGetRentalRequest = {
      email: rentalRequest.email,
      firstName: rentalRequest.firstName,
      lastName: rentalRequest.lastName,
      phone: rentalRequest.phone,
      message: rentalRequest.message,
      address: rentalRequest.address,
      from: rentalRequest.from,
      to: rentalRequest.to,
      taxe: rentalRequest.taxe,
      price: rentalRequest.price,
      menage: rentalRequest.menage,
      nbLitSimple: rentalRequest.nbLitSimple,
      nbLitDouble: rentalRequest.nbLitDouble,
      nbLinge: rentalRequest.nbLinge,
      adults: rentalRequest.adults,
      kids: rentalRequest.kids,
      babies: rentalRequest.babies,
      animals: rentalRequest.animals,
      requestDate: rentalRequest.requestDate,
      paymentStatus: rentalRequest.paymentStatus,
      links: {},
    }

    if (requester?.isAdmin) {
      const deleteUri = routes.DELETE_RENTAL_REQUEST.replace(
        ':rentalRequestId',
        rentalRequest._id.toString()
      )
      restRentalRequest.links.delete = `${deleteUri}`
    }

    return restRentalRequest
  }
}
