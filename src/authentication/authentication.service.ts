import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

// ***********************************************************************************************************************************************
  async signIn(createAuthenticationDto: CreateAuthenticationDto) {
    const user = await this.validateUser(
      createAuthenticationDto.mobile,
      createAuthenticationDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
  
    const payload = { sub: user.id, mobile: user.mobile };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
  
    // Store the refresh token in redis
    await this.refreshTokenIdsStorage.insert(user.id, refreshToken);
  
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      message: 'Logged in successfully',
    };
  }
  

// ***********************************************************************************************************************************************
  async validateUser(mobile: string, password: string): Promise<any> {
    const user = await this.usersService.findByMobile(mobile);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

// ***********************************************************************************************************************************************
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      await this.refreshTokenIdsStorage.validate(decoded.sub, refreshToken);
      const payload = { sub: decoded.sub, mobile: decoded.mobile };
      const accessToken = await this.jwtService.signAsync(payload);
      return { access_token: accessToken };
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

// ***********************************************************************************************************************************************
  async invalidateToken(accessToken: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken);
      await this.refreshTokenIdsStorage.invalidate(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

// ***********************************************************************************************************************************************
  // async getProfile(accessToken: string): Promise<User> {
  //   try {
  //     const decoded = await this.jwtService.verifyAsync(accessToken);
  //     const user = await this.usersService.getUserProfile(decoded.sub);
  //     if (!user) {
  //       throw new UnauthorizedException('User not found');
  //     }
  //     return user;
  //   } catch (error) {
  //     this.logger.error(`Error: ${error.message}`);
  //     throw new UnauthorizedException('Invalid access token');
  //   }
  // }

// ***********************************************************************************************************************************************
  async getProfile(accessToken: string): Promise<Partial<User>> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken);
      const user = await this.usersService.getUserProfile(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
