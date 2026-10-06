import { AuthModule } from '../auth/auth.module.js';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { EventsController } from './events.controller.js';
import { EventsRepository } from './events.repository.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsRepository, EventsService],
})
export class EventsModule {}
