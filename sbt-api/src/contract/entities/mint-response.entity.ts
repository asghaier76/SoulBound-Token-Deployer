import { ApiProperty } from '@nestjs/swagger';

export class MintResponseEntity {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  block: string;

  @ApiProperty()
  address: string;
}
