import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  userEmail: string;
  role: string;
  clientId?: string;
  employeeId?: string;
  supporterId?: string;
  managerId?: string;
  adminId?: string;
  viewerId?: string;
  superAdminId?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
