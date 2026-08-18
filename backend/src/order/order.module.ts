import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule.register()],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
