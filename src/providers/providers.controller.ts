import { Controller, Get } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ExchangeRate } from './providers.service';
import { UseInterceptors} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('providers')
@UseInterceptors(CacheInterceptor)
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService){}

    @Get('/bank-rates')
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