import { Controller, Get, Query, ParseBoolPipe } from '@nestjs/common';
import { ArbitrageService, ArbitrageOpportunity } from './arbitrage.service';

@Controller('arbitrage')
export class ArbitrageController {

    constructor(private readonly arbitrageService: ArbitrageService) { }

    @Get()
    async getOpportunities(
        // ParseBoolPipe convierte automáticamente el string "true" en un booleano true
        @Query('crypto', ParseBoolPipe) includeCrypto: boolean,
    ): Promise<ArbitrageOpportunity[]> {
        return this.arbitrageService.getArbitrageOpportunities(includeCrypto);
    }

}
