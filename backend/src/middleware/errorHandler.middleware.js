// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("Error caught by errorHandler:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma-specific errors for more user-friendly messages
  if (err.code) { // Prisma error codes
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        statusCode = 409; // Conflict
        message = `Unique constraint failed on the field(s): ${err.meta?.target?.join(', ')}`;
        break;
      case 'P2025': // Record to delete not found
        statusCode = 404;
        message = 'Record not found.';
        break;
      // Add more Prisma error codes as needed
      default:
        message = 'A database error occurred.';
    }
  }
  
  // Specific error types
  if (err.name === 'ValidationError') { // Example for a custom validation error
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = err.message || 'Authentication required.';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = err.message || 'You do not have permission to perform this action.';
  }


  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack in dev
  });
};

export default errorHandler;