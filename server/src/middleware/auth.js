const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
};

// Hard-required auth — 401 if missing/invalid.
const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — token missing');
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — token invalid');
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user not found');
  }
  req.user = user;
  next();
});

// Soft auth — attaches req.user if a valid token is present, otherwise continues anonymously.
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    /* ignore — anonymous request */
  }
  next();
});

module.exports = { protect, optionalAuth };
