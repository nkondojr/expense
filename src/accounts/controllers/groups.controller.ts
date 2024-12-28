import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateGroupDto } from '../dto/groups/create-group.dto';
import { UpdateGroupDto } from '../dto/groups/update-group.dto';
import { GroupsService } from '../../seeders/groups.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    const result = await this.groupsService.create(createGroupDto);
    return result;
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    const result = await this.groupsService.update(uuid, updateGroupDto);
    return result;
  }
}
