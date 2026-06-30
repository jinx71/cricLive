// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || res.statusCode >= 400 ? (err.statusCode || res.statusCode) : 500;
  const code = status < 400 ? 500 : status;

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err.message);
    if (process.env.NODE_ENV === 'development' && err.stack) {
      console.error(err.stack);
    }
  }

  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  };
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }
  res.status(code).json(payload);
};

module.exports = errorHandler;
