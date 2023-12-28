import { ApiProperty } from '@nestjs/swagger';
import { Chains, Networks } from '../../types/enums';
import {
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class MintTokenDto {
  @ApiProperty({
    description: 'contractAddress',
  })
  @IsString()
  @IsEthereumAddress()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    description: 'walletAddress',
  })
  @IsString()
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string;

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
