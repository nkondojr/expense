import { Controller, Get, Post, Body, Patch, Headers, UseGuards, UnauthorizedException, ValidationPipe, UsePipes, Request } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Body() createAuthenticationDto: CreateAuthenticationDto) {
    return this.authenticationService.signIn(createAuthenticationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req: any, 
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user_id = req.user.id;
    await this.authenticationService.changePassword(user_id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @Get('profile')
  async getProfile(@Headers('Authorization') authorization: string): Promise<Partial<User>> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header not found or malformed');
    }
    const accessToken = authorization.split(' ')[1];
    return await this.authenticationService.getProfile(accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1];
    await this.authenticationService.invalidateToken(token);
    return { message: 'Logout successfully' };
  }
}
