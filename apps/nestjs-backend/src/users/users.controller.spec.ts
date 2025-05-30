import {Test, TestingModule} from '@nestjs/testing';
import {mock} from 'jest-mock-extended';
import {ActiveUser} from '../auth/types/active-user.type';
import {ConfirmUserParamDto} from './dto/confirm-user.param.dto';
import {CreateUserBodyDto} from './dto/create-user.body.dto';
import {MeDto} from './dto/me.dto';
import {ResetPasswordConfirmBodyDto} from './dto/reset-password-confirm.body.dto';
import {ResetPasswordRequestBodyDto} from './dto/reset-password-request.body.dto';
import {UpdateUserBodyDto} from './dto/update-user.body.dto';
import {UserDto} from './dto/user.dto';
import {User} from './entities/user.entity';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUserEntity = new User({
    email: 'test@example.com',
    password: 'hashed-password',
    username: 'tester',
    confirmationCode: 'mock-confirm-code',
  });

  beforeEach(async () => {
    mockUserEntity.id = '1';

    // Create a fully typed mock of UsersService
    usersService = mock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user details', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      usersService.getUserById.mockResolvedValue(mockUserEntity);

      const result = await controller.getMe(mockActiveUser);

      expect(result).toBeInstanceOf(MeDto);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('tester');
      expect(usersService.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const mockCreateUserDto: CreateUserBodyDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'tester',
      };

      usersService.createUser.mockResolvedValue(mockUserEntity);

      const result = await controller.createUser(mockCreateUserDto);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('tester');
      expect(usersService.createUser).toHaveBeenCalledWith('test@example.com', 'password123', 'tester');
    });
  });

  describe('confirmUser', () => {
    it('should confirm a user registration', async () => {
      const mockConfirmUserParam: ConfirmUserParamDto = {
        confirmationCode: 'abc123',
      };

      usersService.confirmUser.mockResolvedValue(mockUserEntity);

      const result = await controller.confirmUser(mockConfirmUserParam);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe('1');
      expect(usersService.confirmUser).toHaveBeenCalledWith('abc123');
    });
  });

  describe('deleteUser', () => {
    it('should delete the current user', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      usersService.deleteUser.mockResolvedValue(undefined);

      await controller.deleteUser(mockActiveUser);

      expect(usersService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  describe('requestPasswordReset', () => {
    it('should request a password reset', async () => {
      const mockResetPasswordRequest: ResetPasswordRequestBodyDto = {
        email: 'test@example.com',
      };

      usersService.requestPasswordReset.mockResolvedValue(undefined);

      await controller.requestPasswordReset(mockResetPasswordRequest);

      expect(usersService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('confirmPasswordReset', () => {
    it('should confirm a password reset', async () => {
      const mockResetPasswordConfirm: ResetPasswordConfirmBodyDto = {
        token: 'reset-token',
        password: 'new-password',
      };

      usersService.confirmPasswordReset.mockResolvedValue(undefined);

      await controller.confirmPasswordReset(mockResetPasswordConfirm);

      expect(usersService.confirmPasswordReset).toHaveBeenCalledWith('reset-token', 'new-password');
    });
  });

  describe('updateUser', () => {
    it('should update email only', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      const mockUpdateDto: UpdateUserBodyDto = {
        email: 'new@example.com',
      };

      const updatedUserEntity = new User({
        email: 'new@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: '',
      });
      updatedUserEntity.id = '1';

      usersService.updateUser.mockResolvedValue(updatedUserEntity);

      const result = await controller.updateUser(mockActiveUser, mockUpdateDto);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.email).toBe('new@example.com');
      expect(usersService.updateUser).toHaveBeenCalledWith('1', 'new@example.com', undefined, undefined);
    });

    it('should update username only', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      const mockUpdateDto: UpdateUserBodyDto = {
        username: 'newname',
      };

      const updatedUserEntity = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'newname',
        confirmationCode: '',
      });
      updatedUserEntity.id = '1';

      usersService.updateUser.mockResolvedValue(updatedUserEntity);

      const result = await controller.updateUser(mockActiveUser, mockUpdateDto);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.username).toBe('newname');
      expect(usersService.updateUser).toHaveBeenCalledWith('1', undefined, 'newname', undefined);
    });

    it('should update password only', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      const mockUpdateDto: UpdateUserBodyDto = {
        password: 'new-password',
      };

      usersService.updateUser.mockResolvedValue(mockUserEntity);

      const result = await controller.updateUser(mockActiveUser, mockUpdateDto);

      expect(result).toBeInstanceOf(UserDto);
      expect(usersService.updateUser).toHaveBeenCalledWith('1', undefined, undefined, 'new-password');
    });

    it('should update multiple fields', async () => {
      const mockActiveUser: ActiveUser = {
        userId: '1',
      };

      const mockUpdateDto: UpdateUserBodyDto = {
        email: 'new@example.com',
        username: 'newname',
        password: 'new-password',
      };

      const updatedUserEntity = new User({
        email: 'new@example.com',
        password: 'hashed-new-password',
        username: 'newname',
        confirmationCode: '',
      });
      updatedUserEntity.id = '1';

      usersService.updateUser.mockResolvedValue(updatedUserEntity);

      const result = await controller.updateUser(mockActiveUser, mockUpdateDto);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.email).toBe('new@example.com');
      expect(result.username).toBe('newname');
      expect(usersService.updateUser).toHaveBeenCalledWith('1', 'new@example.com', 'newname', 'new-password');
    });
  });
});
