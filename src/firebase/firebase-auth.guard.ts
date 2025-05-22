// firebase-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}