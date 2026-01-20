import { Role } from 'generated/prisma';
import { JwtPayload } from 'src/types/RequestWithUser';

export function buildJwtPayload(user: {
  id: string;
  role: Role;
  email: string;
}): JwtPayload {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
  };
}
