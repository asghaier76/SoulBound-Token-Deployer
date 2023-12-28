import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'Email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
