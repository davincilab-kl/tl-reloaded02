import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class StudentPasswordGuard extends AuthGuard('student-password') {}
