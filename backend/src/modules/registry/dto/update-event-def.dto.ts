import { PartialType } from '@nestjs/swagger';
import { CreateEventDefDto } from './create-event-def.dto';

export class UpdateEventDefDto extends PartialType(CreateEventDefDto) {}
