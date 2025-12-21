import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
console.log(
  'Using @prisma/client version:',
  require('@prisma/client/package.json').version,
);
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
