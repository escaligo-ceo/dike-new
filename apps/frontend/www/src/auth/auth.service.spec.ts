import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CommunicationModule } from '../communication/communication.module';
import { RegisterUserDto } from '@dike/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommunicationModule],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user', async () => {
      const newUserDto: RegisterUserDto = {
        email: 'user@nike.cloud',
        password: 'password123',
        username: 'testuser',
      };

      // Mock user for expected result
      const expected = {
        email: newUserDto.email,
        username: newUserDto.username,
        id: 'some-id',
        createdAt: new Date(),
      };

      try {
        const response = await service.registerUser(newUserDto);

        expect(response).toEqual(expected);
      } catch (error) {
        // Handle error if needed
        console.error('Error during user registration:', error);
        expect(error).toBeUndefined(); // Ensure no error is thrown
      }
    });
  });

  describe('loginUser', () => {
    it.todo('should login a user');
  });

  describe('logoutUser', () => {
    it.todo('should logout a user');
  });

  describe('refreshToken', () => {
    it.todo('should refresh a user token');
  });
});

