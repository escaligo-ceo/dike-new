import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailGenericResponse, VerificationEmailOptions } from './email.interface';
import { EmailModule } from './email.module';

let controller: EmailController;

describe('EmailController', () => {
  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        EmailModule,
      ],
    }).compile();

    controller = app.get<EmailController>(EmailController);
  });

  describe('/verification (POST)', () => {
    it('should a verification email', async () => {
      const options: VerificationEmailOptions = {
        to: 'tommaso@centurioni.eu',
        link: 'https://dike.cloud/verify?token=123456',
        username: 'Tommaso'
      };
      const response: EmailGenericResponse = await controller.sendVerificationEmail(options);
      expect(response.success).toBeTruthy();
      expect(response.message).toBe('successo');
    });
  });
});
