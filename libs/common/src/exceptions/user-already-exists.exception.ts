import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(message = 'User with this email or username already exists') {
    super(message, HttpStatus.CONFLICT);
    this.name = 'UserAlreadyExistsException';
  }
}