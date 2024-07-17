import dotenv from "dotenv";
dotenv.config();
import pkg from "jsonwebtoken";
const { sign, decode, verify } = pkg;
import { StatusCodes } from "http-status-codes";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

const generateAccessToken = (payload) => {
  return sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (payload) => {
  return sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

const generateAccessTokenFromRefreshToken = (refreshToken) => {
  const payload = decode(refreshToken, REFRESH_TOKEN_SECRET);
  return generateAccessToken(payload);
};

const checkAccessToken = async (token, tokenType) => {
  try {
    return tokenType === "access"
      ? verify(token, ACCESS_TOKEN_SECRET)
      : verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Access denied" });
  }
  try {
    const decoded = decode(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  }
};

const verifyAccessToken = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Access denied" });
  }
  try {
    const tokenValid = await checkAccessToken(token, "access");
    if (tokenValid) {
      return res.status(StatusCodes.OK).send("Token Verified");
    }

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  } catch (error) {
    console.log("Error Verifying Token", { error });

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const tokenValid = await checkAccessToken(token, "refresh");
    if (!tokenValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }
    const payload = {
      email: tokenValid.email,
      id: tokenValid.id,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return res.status(StatusCodes.OK).send({ accessToken, refreshToken });
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
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
