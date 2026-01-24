import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { HttpAuthService } from '../communication/http.auth.service';
import { AppLogger } from '@dike/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HttpAuditService } from '@dike/communication';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, HttpModule],
      controllers: [AuthController],
      providers: [AuthService, HttpAuthService, AppLogger, ConfigService, HttpAuditService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const mockRegisterDto = {
      username: 'testuser',
      email: 'test@dike.cloud',
      password: 'testpassword',
    };
    const expected = {
      message: 'Registrazione effettuata con successo',
      data: {
        id: 'new-user-id',
        email: mockRegisterDto.email,
      }
    };
    jest.spyOn(controller['authService'], 'register').mockResolvedValue(expected.data);
    const mockIp = '127.0.0.1';
    const mockUserAgent = 'jest-test-agent';
    const mockAuthorization = 'Bearer mockToken';
    const result = await controller.register(mockIp, mockUserAgent, mockAuthorization, mockRegisterDto);
    expect(result).toEqual(expected);
    // expect(controller['authService'].register).toHaveBeenCalledWith(mockIp, mockUserAgent, mockAuthorization, mockRegisterDto);
  });
});
