import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
}
