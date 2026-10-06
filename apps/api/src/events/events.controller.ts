import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard.js';
import { RequirePermissions } from '../auth/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { ListEventsDto } from './dto/list-events.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { EventsService } from './events.service.js';

@Controller('events')
@UseGuards(AccessTokenGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @RequirePermissions('read:events')
  list(@Query() query: ListEventsDto) {
    return this.eventsService.list(query);
  }

  @Get(':id')
  @RequirePermissions('read:events')
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @RequirePermissions('create:events')
  create(@Body() input: CreateEventDto) {
    return this.eventsService.create(input);
  }

  @Patch(':id')
  @RequirePermissions('update:events')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateEventDto,
  ) {
    return this.eventsService.update(id, input);
  }

  @Post(':id/cancel')
  @RequirePermissions('cancel:events')
  @HttpCode(200)
  cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventsService.cancel(id);
  }
}
