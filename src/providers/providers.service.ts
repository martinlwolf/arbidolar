import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EXCHANGE_METADATA } from '../utils/exchange.metadata';

export interface ExchangeRate {
    bid: number;
    ask: number;
    logoUrl: string;
    name: string;
}

@Injectable()
export class ProvidersService {
    constructor(private readonly httpService: HttpService) { }
    private readonly COMPARADOLAR_URL = "https://api.comparadolar.ar"
    private readonly CRIPTOYA_URL = "https://criptoya.com/api"
    private readonly DEFAULT_LOGO = 'https://cdn-icons-png.flaticon.com/512/10449/10449543.png';
    
    async getBankUsdRates(): Promise<ExchangeRate[] | null> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.COMPARADOLAR_URL}/usd`)
            );
            return data.map(({ bid, ask, logoUrl, prettyName: name }) => ({
                bid,
                ask,
                logoUrl,
                name,
            }));
        } catch (error) {
            console.error('Error bringing bank usd rates from comparadolar', error);
            return null;
        }
    }

// --- MÉTODOS DE CRIPTOYA ---

    async getUsdCRates() {
        return this.fetchCriptoYaData('usdc');
    }

    async getUsdTRates() {
        return this.fetchCriptoYaData('usdt');
    }

    private async fetchCriptoYaData(coin: string): Promise<ExchangeRate[] | null> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.CRIPTOYA_URL}/${coin}/ars/0.1`)
            );

            return Object.entries(data).map(([key, value]: [string, any]) => {
                const meta = EXCHANGE_METADATA[key];
                return {
                    bid: value.totalBid,
                    ask: value.totalAsk,
                    logoUrl: meta ? meta.logo : this.DEFAULT_LOGO,
                    name: meta ? meta.name : key.toUpperCase(), // Si no hay meta, lo ponemos en mayúsculas
                };
            });
        } catch (error) {
            console.error(`Error bringing ${coin} rates from CriptoYa`, error);
            return null;
        }
    }
}
