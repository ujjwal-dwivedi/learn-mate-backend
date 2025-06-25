import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to LearnMate API - Your AI-powered task management system!';
  }
}
