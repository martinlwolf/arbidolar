import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvidersModule } from './providers/providers.module';
import { ArbitrageModule } from './arbitrage/arbitrage.module';


@Module({
  imports: [ProvidersModule, ArbitrageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
