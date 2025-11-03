import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    return {
      success: true,
      data: user,
      message: 'User registered successfully',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto.email, loginDto.password);
    const tokens = await this.authService.createJWTToken(user.id);
    
    return {
      success: true,
      data: {
        user,
        ...tokens,
      },
      message: 'Login successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.id;
    const token = req.headers.authorization?.replace('Bearer ', '');
    await this.authService.logout(userId, token);
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.authService.getUserById(req.user.id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }
}

