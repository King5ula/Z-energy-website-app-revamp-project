// ponytail: Consistent API response formatting (Rung 5: Pure logic)
// Why: DRY principle - single response structure across all endpoints
// Ceiling: Simple success/error format, no pagination metadata helpers
// Upgrade: Use custom ApiResponse class if need more response types (warnings, partial success)

// this basically sends a successful response with optional message
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// this basically sends an error response with appropriate status code
export const sendError = (res, error, statusCode = 500) => {
  const message = error.message || 'Internal server error';
  console.error('Error:', message);

  res.status(statusCode).json({
    success: false,
    error: message
  });
};
