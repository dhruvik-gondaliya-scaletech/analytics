import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token = this.extractTokenFromHeader(request);
    if (!token && request.cookies) {
      token = request.cookies['analytics_session'];
    }

    if (!token) {
      throw new UnauthorizedException('Authentication session or token missing');
    }

    try {
      const secret =
        this.configService.get<string>('DASHBOARD_SESSION_SECRET') ||
        'secret-analytics-key-2026';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
