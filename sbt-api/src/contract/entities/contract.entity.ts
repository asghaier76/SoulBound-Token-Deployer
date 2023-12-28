import { ApiProperty } from '@nestjs/swagger';
import { Contract } from '@prisma/client';

export class ContractEntity implements Contract {
  constructor(partial: Partial<ContractEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  contractAddress: string;

  @ApiProperty()
  deployerAddress: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  chain: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;
}
