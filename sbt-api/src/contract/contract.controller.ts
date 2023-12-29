import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContractDto } from 'src/contract/dto/create-contract.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ContractService } from './contract.service';
import { ContractEntity } from './entities/contract.entity';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { MintTokenDto } from './dto/mint-token.dto';
import { MintResponseEntity } from './entities/mint-response.entity';

@ApiTags('Contract')
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Creates a new SBT Token contract' })
  @ApiResponse({
    status: 200,
    description: 'Contract successfully deployed',
    type: ContractEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  deploy(@Body() contract: CreateContractDto, @UserId() userId: string) {
    return this.contractService.deployContract(contract, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mint')
  @ApiOperation({ summary: 'Mints SBT Token in a contract' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully minted',
    type: MintResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  mint(@Body() data: MintTokenDto, @UserId() userId: string) {
    return this.contractService.mintToken(data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Retruns list of all deployed contracts for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all deployed contracts',
    type: MintResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  getContracts(@UserId() userId: string) {
    return this.contractService.getContracts(userId);
  }
}
