import { PartialType } from '@nestjs/swagger';
import { CreateChildProfileDto } from './create-child-profile.dto';

export class UpdateChildProfileDto extends PartialType(CreateChildProfileDto) {}
