export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitized } = user;
  return sanitized;
};

export const createErrorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

export const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

