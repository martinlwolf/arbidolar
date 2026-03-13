import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvidersModule } from './providers/providers.module';
import { ArbitrageModule } from './arbitrage/arbitrage.module';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [ProvidersModule, ArbitrageModule, CacheModule.register({
    isGlobal: true, // Para no tener que importarlo en cada módulo
    ttl: 60000,     // Tiempo en milisegundos (60 segundos)
    max: 100,       // Cantidad máxima de respuestas en memoria
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
