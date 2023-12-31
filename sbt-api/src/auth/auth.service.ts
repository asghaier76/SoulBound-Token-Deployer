import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/dto/user.dto';
import { Prisma } from '@prisma/client';
import { PrismaError } from 'src/prisma/prisma.errors';

@Injectable()
export class AuthService {
  private logger = new Logger('Auth Service');

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  public async register(userData: UserDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    try {
      const createdUser = await this.userService.create({
        ...userData,
        password: hashedPassword,
      });
      this.logger.log('New user account created ', createdUser.id);
      return {
        ...createdUser,
        password: undefined,
        key: undefined,
      };
    } catch (error) {
      this.logger.error('Error encountered: ', error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error?.code === PrismaError.UniqueConstraintFailed
      ) {
        throw new HttpException(
          'User with provided email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.findOne(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const passwordMatch = await bcrypt.compare(
        plainTextPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }
      this.logger.log('User successfuly logged in', user.id);
      return {
        jwtToken: this.jwtService.sign({ username: user.email, sub: user.id }),
        email,
      };
    } catch (error) {
      this.logger.error('An error occured: ', error);
      throw error;
    }
  }
}
