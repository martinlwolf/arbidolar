import { Controller, Get } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ExchangeRate } from './providers.service';

@Controller('providers')
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService){}

    @Get('/bankusd-rates')
    async getBankUsdRates(): Promise<ExchangeRate[] | null> {
        return this.providersService.getBankUsdRates();
    }

    @Get('/usdc-rates')
    async getUsdCRates(): Promise<ExchangeRate[] | null> {
        return this.providersService.getUsdCRates();
    }

    @Get('/usdt-rates')
    async getUsdTRates(): Promise<ExchangeRate[] | null> {
        return this.providersService.getUsdTRates();
    }

    @Get('/mep-rates')
    async getMepRates(): Promise<ExchangeRate[] | null> {
        return this.providersService.getMepRates();
    }

    @Get('/blue-rate')
    async getBlueRate(): Promise<ExchangeRate | null> {
        return this.providersService.getDolarBlueRate();
    }
}