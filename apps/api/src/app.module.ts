import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
