class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
//bad request
class BadRequestError extends AppError {
  constructor(
    message: string = "Bad request",
    errorCode: string = "BAD_REQUEST"
  ) {
    super(message, 400, errorCode);
  }
}

//missing or invalid token
class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    errorCode: string = "UNAUTHORIZED"
  ) {
    super(message, 401, errorCode);
  }
}

//authenticated but no permission
class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", errorCode: string = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

//resource not found
class NotFoundError extends AppError {
  constructor(message: string = "Not Found", errorCode: string = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

//duplicate resource creation
class ConflictError extends AppError {
  constructor(message: string = "Conflict", errorCode: string = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

//Prisma-specific Error (wraps Prisma's internal errors into a known AppError)
class PrismaClientError extends AppError {
  constructor(message: string, statusCode: number, prismaCode: string) {
    super(message, statusCode, prismaCode);
    this.isOperational = true;
  }
}

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PrismaClientError,
};
