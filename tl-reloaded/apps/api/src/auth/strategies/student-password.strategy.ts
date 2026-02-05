import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class StudentPasswordStrategy extends PassportStrategy(
  Strategy,
  'student-password',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'password', // For students, password is the only identifier
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(password: string): Promise<any> {
    const user = await this.authService.validateStudentByPassword(password);
    if (!user) {
      throw new UnauthorizedException('Invalid student password');
    }
    return user;
  }
}
