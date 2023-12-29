import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseEntity {
  @ApiProperty()
  email: string;

  @ApiProperty()
  jwtToken: string;
}
