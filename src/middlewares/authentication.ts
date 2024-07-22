import dotenv from "dotenv";
import pkg from "jsonwebtoken";
import { Request, Response, NextFunction } from "express"; // Assuming you're using Express
import { StatusCodes } from "http-status-codes";

dotenv.config();

const { sign, decode, verify } = pkg;

interface Payload {
  email: string;
  id: string;
}

const ACCESS_TOKEN_SECRET: string | undefined = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY: string | undefined = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET: string | undefined =
  process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY: string | undefined =
  process.env.REFRESH_TOKEN_EXPIRY;

const generateAccessToken = (payload: Payload): string => {
  return sign(payload, ACCESS_TOKEN_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (payload: Payload): string => {
  return sign(payload, REFRESH_TOKEN_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

const generateAccessTokenFromRefreshToken = (refreshToken: string): string => {
  const payload = decode(refreshToken) as Payload;
  return generateAccessToken(payload);
};

const checkAccessToken = async (
  token: string,
  tokenType: "access" | "refresh"
): Promise<Payload | null> => {
  try {
    return tokenType === "access"
      ? (verify(token, ACCESS_TOKEN_SECRET!) as Payload)
      : (verify(token, REFRESH_TOKEN_SECRET!) as Payload);
  } catch (error) {
    return null;
  }
};

const verifyToken = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  const token: string | undefined = req.headers.authorization;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access denied" });
    return;
  }
  try {
    const decoded = decode(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

const verifyAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token: string | undefined = req.headers.authorization;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access denied" });
    return;
  }
  try {
    const tokenValid = await checkAccessToken(token, "access");
    if (tokenValid) {
      res.status(StatusCodes.OK).send("Token Verified");
      return;
    }
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  } catch (error) {
    console.log("Error Verifying Token", { error });
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token: string | undefined = req.headers.authorization;
    const tokenValid = await checkAccessToken(token!, "refresh");
    if (!tokenValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
      return;
    }
    const payload: Payload = {
      email: tokenValid.email,
      id: tokenValid.id,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    res.status(StatusCodes.OK).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  checkAccessToken,
  generateAccessTokenFromRefreshToken,
  verifyToken,
  verifyAccessToken,
  refreshAccessToken,
};
