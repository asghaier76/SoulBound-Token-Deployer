import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  @ApiProperty()
  email: string;

  @ApiProperty()
  jwtToken: string;
}
