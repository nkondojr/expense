import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hellow World!!!!! Welcome to Rinward Project(Nestjs)';
  }
}
