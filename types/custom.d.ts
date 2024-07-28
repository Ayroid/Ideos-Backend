import { Request } from "express";

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserInfo;
}

export { AuthenticatedRequest };
