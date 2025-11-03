import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/roles.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @UseGuards(RolesGuard)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.createRole(
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.permissions,
    );
    return {
      success: true,
      data: role,
      message: 'Role created successfully',
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  async getAllRoles() {
    const roles = await this.rolesService.getAllRoles();
    return {
      success: true,
      data: roles,
      message: 'Roles retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  async getRoleById(@Param('id') id: string) {
    const role = await this.rolesService.getRoleById(id);
    return {
      success: true,
      data: role,
      message: 'Role retrieved successfully',
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesService.updateRole(id, updateRoleDto);
    return {
      success: true,
      data: role,
      message: 'Role updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.deleteRole(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  @Post('assign')
  @UseGuards(RolesGuard)
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    const userRole = await this.rolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
    return {
      success: true,
      data: userRole,
      message: 'Role assigned to user successfully',
    };
  }

  @Post('remove')
  @UseGuards(RolesGuard)
  async removeRole(@Body() assignRoleDto: AssignRoleDto) {
    await this.rolesService.removeRoleFromUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
    return {
      success: true,
      message: 'Role removed from user successfully',
    };
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  async getUserRoles(@Param('userId') userId: string) {
    const roles = await this.rolesService.getUserRoles(userId);
    return {
      success: true,
      data: roles,
      message: 'User roles retrieved successfully',
    };
  }

  @Get('me/permissions')
  async getMyPermissions(@Req() req) {
    // Get from authenticated user
    const userId = req.user.id;
    const permissions = await this.rolesService.getUserPermissions(userId);
    return {
      success: true,
      data: { permissions },
      message: 'Permissions retrieved successfully',
    };
  }
}

