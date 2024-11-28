import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service'; // Adjust the import as necessary

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authenticationService: AuthenticationService, // Inject AuthenticationService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const token = authHeader.split(' ')[1];

    if (this.authenticationService.isTokenInvalidated(token)) {
      this.logger.error('Token has been invalidated');
      throw new UnauthorizedException('Token has been invalidated');
    }

    const canActivate = super.canActivate(context);

    if (canActivate instanceof Observable) {
      return canActivate.toPromise();
    }

    return canActivate;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.error('Unauthorized request', err || info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
