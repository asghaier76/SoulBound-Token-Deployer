import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContractController } from './contract.controller';

@Module({
  providers: [ContractService],
  imports: [PrismaModule],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule {}
