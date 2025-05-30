import {Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post} from '@nestjs/common';
import {ApiResponse, ApiTags, ApiOperation} from '@nestjs/swagger';
import {Throttle} from '@nestjs/throttler';
import {Public} from '../auth/decorators/public.decorator';
import {User} from '../auth/decorators/user.decorator';
import type {ActiveUser} from '../auth/types/active-user.type';
import {oneHour, oneMinute} from '../utils/time.util';
import {ConfirmUserParamDto} from './dto/confirm-user.param.dto';
import {CreateUserBodyDto} from './dto/create-user.body.dto';
import {MeDto} from './dto/me.dto';
import {ResetPasswordConfirmBodyDto} from './dto/reset-password-confirm.body.dto';
import {ResetPasswordRequestBodyDto} from './dto/reset-password-request.body.dto';
import {UpdateUserBodyDto} from './dto/update-user.body.dto';
import {UserDto} from './dto/user.dto';
import {UsersService} from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user details',
    description: 'This endpoint retrieves the details of the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user details.',
    type: MeDto,
  })
  async getMe(@User() user: ActiveUser): Promise<MeDto> {
    const {userId} = user;
    const userEntity = await this.usersService.getUserById(userId);
    return new MeDto(userEntity);
  }

  @Post()
  @Public()
  @Throttle({default: {ttl: oneHour, limit: 60}}) // allow 60 requests per hour per IP address
  @ApiOperation({
    summary: 'Create a new user',
    description: 'This endpoint creates a new user by providing an email, password, and username.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created.',
    type: UserDto,
  })
  async createUser(@Body() body: CreateUserBodyDto): Promise<UserDto> {
    const {email, password, username} = body;
    const userEntity = await this.usersService.createUser(email, password, username);
    return new UserDto(userEntity);
  }

  @Post('confirm/:confirmationCode')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // allow 10 requests per 15 minutes per IP address
  @ApiOperation({
    summary: 'Confirm user registration',
    description: 'This endpoint confirms a user registration using a confirmation code sent to their email.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully confirmed.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid confirmation code.',
  })
  async confirmUser(@Param() param: ConfirmUserParamDto): Promise<UserDto> {
    const {confirmationCode} = param;
    const userEntity = await this.usersService.confirmUser(confirmationCode);
    return new UserDto(userEntity);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete the current user',
    description: 'This endpoint deletes the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted.',
  })
  async deleteUser(@User() user: ActiveUser): Promise<void> {
    const {userId} = user;
    await this.usersService.deleteUser(userId);
  }

  @Post('reset-password/request')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // allow 10 requests per 15 minutes per IP address
  @ApiOperation({
    summary: 'Request password reset',
    description: 'This endpoint requests a password reset for the user using their email address.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset request successfully sent.',
  })
  async requestPasswordReset(@Body() body: ResetPasswordRequestBodyDto): Promise<void> {
    const {email} = body;
    await this.usersService.requestPasswordReset(email);
  }

  @Post('reset-password/confirm')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 3}}) // allow 10 requests per 15 minutes per IP address
  @ApiOperation({
    summary: 'Confirm password reset',
    description: 'This endpoint confirms the password reset by providing a valid token and new password.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid token or password.',
  })
  async confirmPasswordReset(@Body() body: ResetPasswordConfirmBodyDto): Promise<void> {
    const {token, password} = body;
    await this.usersService.confirmPasswordReset(token, password);
  }

  @Patch()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // allow 10 requests per 15 minutes per IP address
  @ApiOperation({
    summary: 'Update current user details',
    description: 'This endpoint allows the currently authenticated user to update their email, password, or username.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details successfully updated.',
    type: UserDto,
  })
  async updateUser(@User() user: ActiveUser, @Body() body: UpdateUserBodyDto): Promise<UserDto> {
    const {userId} = user;
    const {email, password, username} = body;
    const userEntity = await this.usersService.updateUser(userId, email, username, password);
    return new UserDto(userEntity);
  }
}
