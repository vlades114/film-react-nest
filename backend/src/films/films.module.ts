import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule.register()],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
