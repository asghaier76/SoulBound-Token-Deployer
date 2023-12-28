import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: UserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
