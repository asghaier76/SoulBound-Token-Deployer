import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateWalletKey } from './utils/wallet-key-util';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: UserDto) {
    const wallet = await generateWalletKey();
    return this.prisma.user.create({
      data: { ...createUserDto, ...wallet },
    });
  }

  findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
