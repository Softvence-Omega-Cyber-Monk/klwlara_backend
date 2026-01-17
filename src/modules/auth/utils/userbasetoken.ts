import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma';
import { JwtPayload } from 'src/types/RequestWithUser';

export async function buildJwtPayload(
  prisma: PrismaService,
  user: { id: string; role: Role; email: string },
): Promise<
  JwtPayload & {
    clientId?: string;
    employeeId?: string;
    supporterId?: string;
    managerId?: string;
    adminId?: string;
    viewerId?: string;
    superAdminId?: string;
  }
> {
  const jwtPayload: JwtPayload & {
    clientId?: string;
    employeeId?: string;
    supporterId?: string;
    managerId?: string;
    adminId?: string;
    viewerId?: string;
    superAdminId?: string;
  } = {
    userId: user.id,
    role: user.role,
    userEmail: user.email,
  };

  switch (user.role) {
    case Role.USER: {
      const supporter = await prisma.client.supporter.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (supporter) jwtPayload.supporterId = supporter.id;
      break;
    }

    case Role.ADMIN: {
      const admin = await prisma.client.admin.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (admin) jwtPayload.adminId = admin.id;
      break;
    }

    default:
      break;
  }

  return jwtPayload;
}
