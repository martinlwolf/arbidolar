import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService]
})
export class ProvidersModule {}
