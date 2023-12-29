import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/user/dto/user.dto';
import { UserResponseEntity } from 'src/user/entities/user.entity';
import { AuthResponseEntity } from './entities/auth.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 200,
    description: 'User recorde successfully created',
    type: UserResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  register(@Body() registerUserDto: UserDto) {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Authenticates a user' })
  @ApiResponse({
    status: 200,
    description: 'User Logged in',
    type: AuthResponseEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(@Body() loginUserDto: UserDto) {
    return this.authService.getAuthenticatedUser(
      loginUserDto.email,
      loginUserDto.password,
    );
  }
}
