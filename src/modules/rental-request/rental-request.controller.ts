import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  forwardRef,
} from '@nestjs/common'
import type { IPostNewRentalRequest } from './IRentalRequest.js'
import type {
  IPostQuestion,
  IPostRentalRequestBilling,
} from './IRestRentalRequest.js'
import { RentalRequestService } from './rental-request.service.js'

@Controller('rental-requests')
export class RentalRequestController {
  constructor(
    @Inject(forwardRef(() => RentalRequestService))
    private readonly rentalRequestService: RentalRequestService
  ) {}

  @Get('/')
  async getRentalRequests(@Headers('authorization') token: string) {
    return await this.rentalRequestService.getRentalRequests(token)
  }

  @Get('/clientSecret/:clientSecret')
  async getRentalRequestByClientSecret(
    @Param('clientSecret') clientSecret: string
  ) {
    return await this.rentalRequestService.getRentalRequestByClientSecret(
      clientSecret
    )
  }

  @Post('/contact')
  async postQuestion(@Body() body: IPostQuestion) {
    return await this.rentalRequestService.createQuestion(body)
  }

  @Post('/webhook')
  async stripeWebhooks(@Body() hook: any) {
    return await this.rentalRequestService.stripeWebhook(hook)
  }

  @Post('/')
  async createRentalRequest(
    @Body() body: IPostNewRentalRequest,
    @Headers('authorization') token?: string
  ) {
    return await this.rentalRequestService.createRentalRequestAndPaymentIntent(
      body,
      token
    )
  }

  @Post('/:clientSecret/add-billing')
  async addCustomerInformation(
    @Param('clientSecret') clientSecret: string,
    @Body() body: IPostRentalRequestBilling,
    @Headers('authorization') token?: string
  ) {
    return await this.rentalRequestService.addCustomerInformation(
      clientSecret,
      body,
      token
    )
  }

  @Delete('/:rentalRequestId/delete')
  async deleteRentalRequest(
    @Param('rentalRequestId') rentalRequestId: string,
    @Headers('authorization') token: string
  ) {
    return await this.rentalRequestService.deleteRentalRequest(
      rentalRequestId,
      token
    )
  }
}
