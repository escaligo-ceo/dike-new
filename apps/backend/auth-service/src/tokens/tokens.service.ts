import { AppLogger } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerificationToken } from "../entities/email-verification-token.entity";

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    public emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    private readonly logger: AppLogger,
  ) {
    this.logger = new AppLogger(TokensService.name);
  }

  // Define your service methods here
}