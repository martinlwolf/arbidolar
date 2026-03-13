import { Controller, Get, Query, ParseBoolPipe } from '@nestjs/common';
import { ArbitrageService, ArbitrageOpportunity } from './arbitrage.service';
import { UseInterceptors} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('arbitrage')
@UseInterceptors(CacheInterceptor)
export class ArbitrageController {

    constructor(private readonly arbitrageService: ArbitrageService) { }

    @Get()
    async getOpportunities(
        @Query('crypto', ParseBoolPipe) includeCrypto: boolean,
        @Query('mep', ParseBoolPipe) includeMep: boolean,
        @Query('bankusd', ParseBoolPipe) includeBankUsd: boolean,
        @Query('blue', ParseBoolPipe) includeBlue: boolean,
    ): Promise<ArbitrageOpportunity[]> {
        return this.arbitrageService.getArbitrageOpportunities({
            includeCrypto,
            includeMep,
            includeBankUsd,
            includeBlue,
        });
    }

}
