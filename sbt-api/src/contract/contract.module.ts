import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContractController } from './contract.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ContractService],
  imports: [PrismaModule, UserModule],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule {}
