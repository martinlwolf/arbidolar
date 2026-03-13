import { Injectable } from '@nestjs/common';
import { ProvidersService } from '../providers/providers.service';

export interface ArbitrageOpportunity {
    buyAt: { name: string; price: number; logo: string; };
    sellAt: { name: string; price: number; logo: string; };
    spread: number;
    netProfit: number;
}

@Injectable()
export class ArbitrageService {

    constructor(private readonly providersService: ProvidersService) { }

    async getArbitrageOpportunities({
        includeCrypto,
        includeMep,
        includeBankUsd,
        includeBlue,
    }: {
        includeCrypto: boolean;
        includeMep: boolean;
        includeBankUsd: boolean;
        includeBlue: boolean;
    }) {
        try {
            let allProviders: import('../providers/providers.service').ExchangeRate[] = [];
            if (includeBankUsd) {
                const banks = await this.providersService.getBankUsdRates() ?? [];
                allProviders = [...allProviders, ...banks];
            }
            if (includeMep) {
                const mep = await this.providersService.getMepRates() ?? [];
                allProviders = [...allProviders, ...mep];
            }
            if (includeBlue) {
                const blue = await this.providersService.getDolarBlueRate();
                if (blue) allProviders = [...allProviders, blue];
            }
            if (includeCrypto) {
                const usdt = await this.providersService.getUsdTRates() ?? [];
                const usdc = await this.providersService.getUsdCRates() ?? [];
                allProviders = [...allProviders, ...usdt, ...usdc];
            }

            const opportunities: ArbitrageOpportunity[] = [];

            // Algoritmo de cruce
            for (const buyProvider of allProviders) {
                for (const sellProvider of allProviders) {
                    if (!buyProvider || !sellProvider) continue;
                    if (buyProvider.name === sellProvider.name) continue;
                    // Validar que los precios no sean 0
                    if (
                        !buyProvider.ask || buyProvider.ask === 0 ||
                        !sellProvider.bid || sellProvider.bid === 0
                    ) {
                        continue;
                    }

                    const spread = ((sellProvider.bid / buyProvider.ask) - 1) * 100;

                    // Solo devolvemos oportunidades que den ganancia real (ej: mayor a 0.5%)
                    if (spread > 0.5) {
                        opportunities.push({
                            buyAt: { name: buyProvider.name, price: buyProvider.ask, logo: buyProvider.logoUrl },
                            sellAt: { name: sellProvider.name, price: sellProvider.bid, logo: sellProvider.logoUrl },
                            spread: parseFloat(spread.toFixed(2)),
                            netProfit: sellProvider.bid - buyProvider.ask
                        });
                    }
                }
            }

            // Ordenar por la oportunidad más rentable primero
            return opportunities.sort((a, b) => b.spread - a.spread);
        } catch (error) {
            throw new Error('Error getting arbitrage opportunities: ' + (error?.message || error));
        }
    }
}
