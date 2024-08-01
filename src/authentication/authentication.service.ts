import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  private invalidatedTokens: Set<string> = new Set(); // Ensure this is declared outside the constructor

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,

    @InjectRepository(User)
    private userRepository: Repository<User>
  ) { }

  // ***********************************************************************************************************************************************
  async signIn(createAuthenticationDto: CreateAuthenticationDto) {
    const user = await this.validateUser(
      createAuthenticationDto.email,
      createAuthenticationDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const payload = { sub: user.id, email: user.email };
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
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // ***********************************************************************************************************************************************
  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<string> {
    const { old_password, new_password, confirm_new_password } = changePasswordDto;
    if (new_password !== confirm_new_password) {
      throw new BadRequestException('New passwords do not match');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(new_password, salt);
    user.password = hashedPassword;
    await this.userRepository.save(user);
    return 'Password changed successfully';
  }

  // ***********************************************************************************************************************************************
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      await this.refreshTokenIdsStorage.validate(decoded.sub, refreshToken);
      const payload = { sub: decoded.sub, email: decoded.email };
      const accessToken = await this.jwtService.signAsync(payload);
      return { access_token: accessToken };
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ***********************************************************************************************************************************************
  async getProfile(accessToken: string): Promise<Partial<User>> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken);
      
      // Check if the token is invalidated
      if (await this.isTokenInvalidated(decoded.sub)) {
        throw new UnauthorizedException('Token has been invalidated');
      }
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

  // ***********************************************************************************************************************************************
  async invalidateToken(accessToken: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken);
      await this.refreshTokenIdsStorage.invalidate(decoded.sub);
      this.invalidatedTokens.add(accessToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }
}
