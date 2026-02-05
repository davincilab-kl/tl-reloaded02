import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { StudentPasswordGuard } from './guards/student-password.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { StudentLoginDto } from './dto/student-login.dto';
import { Public } from './decorators/public.decorator';
import { UserRole } from '@repo/db/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.role || UserRole.teacher,
      registerDto.preferredTitle,
      registerDto.phone,
    );
    return this.authService.login(user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(StudentPasswordGuard)
  @Post('student/login')
  async studentLogin(@Request() req, @Body() studentLoginDto: StudentLoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('student/register')
  async registerStudent(@Body() body: { firstName: string; lastName: string }) {
    const { user, password } = await this.authService.registerStudent(
      body.firstName,
      body.lastName,
    );
    const loginResult = await this.authService.login(user);
    return {
      ...loginResult,
      studentPassword: password, // Return password once for display
    };
  }
}
