import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import config from "../config/config";

interface TokenPayload {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  iat: number;
  exp: number;
}

interface IProduct {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  product: IProduct;
}

const jwtSecret = config.JWT_SECRET as string;

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(new ApiError(401, "Missing authorization header"));
  }

  const token = authHeader.split(" ")[1];
  console.log(jwt.decode(token));
  console.log(jwtSecret);

  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    req.product = {
      _id: decoded.id,
      name: decoded.name,
      category: decoded.category,
      description: decoded.description,
      price: decoded.price,
      createdAt: new Date(decoded.iat * 1000),
      updatedAt: new Date(decoded.exp * 1000),
    };
    return next();
  } catch (error) {
    console.error(error);
    return next(new ApiError(401, "Invalid token"));
  }
};

const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof Error ? 400 : 500);
    const message =
      error.message ||
      (statusCode === 400 ? "Bad Request" : "Internal Server Error");
    error = new ApiError(statusCode, message, false, err.stack.toString());
  }
  next(error);
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json(response);
  next();
};

export { authMiddleware, errorConverter, errorHandler };
