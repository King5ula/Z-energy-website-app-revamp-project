// ponytail: Async/await error wrapper for Express routes (Rung 4: Native Promises)
// Why: DRY principle - avoids try/catch in every route handler
// Ceiling: Only handles promise rejections, not synchronous errors
// Upgrade: Use express-async-errors package if need automatic error handling

// this basically wraps async route handlers to catch errors automatically
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};