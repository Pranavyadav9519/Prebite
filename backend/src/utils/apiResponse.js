// Standard API response wrapper
const apiResponse = {
  success: (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...data
    });
  },

  error: (res, message = 'Error', statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },

  created: (res, data = {}, message = 'Created successfully') => {
    return apiResponse.success(res, data, message, 201);
  },

  ok: (res, data = {}, message = 'OK') => {
    return apiResponse.success(res, data, message, 200);
  },

  notFound: (res, message = 'Resource not found') => {
    return apiResponse.error(res, message, 404);
  },

  unauthorized: (res, message = 'Unauthorized access') => {
    return apiResponse.error(res, message, 401);
  },

  forbidden: (res, message = 'Access forbidden') => {
    return apiResponse.error(res, message, 403);
  },

  badRequest: (res, message = 'Bad request', errors = null) => {
    return apiResponse.error(res, message, 400, errors);
  }
};

module.exports = apiResponse;

