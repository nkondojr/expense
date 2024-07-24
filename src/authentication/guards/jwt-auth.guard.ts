import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.error('Authorization header not found');
      throw new UnauthorizedException('Authorization header not found');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.error('Invalid Authorization header format');
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.error('Unauthorized request', err || info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
