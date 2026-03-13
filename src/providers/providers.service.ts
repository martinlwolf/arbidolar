import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EXCHANGE_METADATA } from '../utils/exchange.metadata';
import * as cheerio from 'cheerio';

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
    private readonly BONISTAS_URL = 'https://bonistas.com/';
    private readonly DOLARAPI_URL = 'https://dolarapi.com/v1/dolares/blue';

    // --- MÉTODOS DE COMPARADOLAR ---

    async getBankUsdRates(): Promise<ExchangeRate[] | null> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.COMPARADOLAR_URL}/usd`)
            );
            return data
                .filter(({ bid }) => !this.isBadValue(bid))
                .map(({ bid, ask, logoUrl, prettyName: name }) => ({
                    bid,
                    ask,
                    logoUrl,
                    name,
                }));
        } catch (error) {
            throw new Error('Error bringing bank usd rates from comparadolar: ' + (error?.message || error));
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

            return Object.entries(data)
                .filter(([_, value]: [string, any]) => !this.isBadValue(value.totalBid))
                .map(([key, value]: [string, any]) => {
                    const meta = EXCHANGE_METADATA[key];
                    return {
                        bid: value.totalBid,
                        ask: value.totalAsk,
                        logoUrl: meta ? meta.logo : this.DEFAULT_LOGO,
                        name: meta ? meta.name : key.toUpperCase(),
                    };
                });
        } catch (error) {
            throw new Error(`Error bringing ${coin} rates from CriptoYa: ` + (error?.message || error));
        }
    }
    // --- MÉTODO PARA OBTENER TASAS MEP ---

    async getMepRates(): Promise<ExchangeRate[] | null> {
        try {
            const { data: html } = await firstValueFrom(
                this.httpService.get(this.BONISTAS_URL, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                })
            );

            return this.scrapeMepRatesFromBonistas(html);
        } catch (error) {
            throw new Error('Error fetching Bonistas: ' + (error?.message || error));
        }
    }

    async getDolarBlueRate(): Promise<ExchangeRate | null> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(this.DOLARAPI_URL)
            );
            return {
                bid: data.compra,
                ask: data.venta,
                logoUrl: this.DEFAULT_LOGO,
                name: "Dolar Blue",
            };
        } catch (error) {
            throw new Error('Error fetching DolarAPI Blue rate: ' + (error?.message || error));
        }
    }

    private scrapeMepRatesFromBonistas(html: string): ExchangeRate[] {
        const $ = cheerio.load(html);
        const results: ExchangeRate[] = [];

        $('table tbody tr').each((_, row) => {
            const cells = $(row).find('td');
            const ticker = $(cells[0]).text().trim();
            const mepRaw = $(cells[4]).text().trim();

            if (ticker && mepRaw) {
                const price = parseFloat(mepRaw.replace(/[^0-9.]/g, ''));

                if (!isNaN(price)) {
                    results.push({
                        bid: price,
                        ask: price,
                        logoUrl: "",
                        name: ticker,
                    });
                }
            }
        });

        return results;
    }

        // Filtra valores fuera de rango
    private isBadValue(value: number): boolean {
        return value < 800 || value > 2000;
    }

}
