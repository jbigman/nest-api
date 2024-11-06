import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  forwardRef,
} from '@nestjs/common'
import type {
  IGetPrice,
  IPostDay,
  IPostLodge,
  IPostNewLodge,
} from './IRestLodge.js'
import { LodgeService } from './lodge.service.js'

@Controller('lodge')
export class LodgeController {
  constructor(
    @Inject(forwardRef(() => LodgeService))
    private readonly lodgeService: LodgeService
  ) {}

  @Get('/')
  async getLodges(@Headers('authorization') token: string) {
    return await this.lodgeService.getLodge(token)
  }

  @Get('/price')
  async getPrice(@Body() body: IGetPrice) {
    return await this.lodgeService.getPrice(body)
  }

  @Post('/create')
  async createLodge(
    @Body() body: IPostNewLodge,
    @Headers('authorization') token: string
  ) {
    return await this.lodgeService.createLodge(body, token)
  }

  @Post('/edit')
  async editLodge(
    @Body() body: IPostLodge,
    @Headers('authorization') token: string
  ) {
    return await this.lodgeService.editLodge(body, token)
  }

  @Post('/edit-day')
  async editLodgeDay(
    @Body() body: IPostDay,
    @Headers('authorization') token: string
  ) {
    return await this.lodgeService.editLodgeDay(body, token)
  }
}
