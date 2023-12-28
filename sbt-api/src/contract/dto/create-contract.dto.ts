import { ApiProperty } from '@nestjs/swagger';
import { Chains, Networks } from '../../types/enums';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({
    description: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'symbol',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(7, { message: 'Symbol cannot be more than 7 characters long' })
  symbol: string;

  @ApiProperty({
    description: 'chain',
  })
  @IsEnum(Chains)
  chain: Chains;

  @ApiProperty({
    description: 'network',
  })
  @IsEnum(Networks)
  network: Networks;
}
