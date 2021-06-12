const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitize = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  followedMatches: u.followedMatches,
  favoriteTeams: u.favoriteTeams,
  createdAt: u.createdAt,
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, 'Validation failed', 400, errors.array());

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return fail(res, 'Email already registered', 409);

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  return ok(res, { user: sanitize(user), token }, 'Registered', 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, 'Validation failed', 400, errors.array());

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) return fail(res, 'Invalid email or password', 401);
  const matches = await user.matchPassword(password);
  if (!matches) return fail(res, 'Invalid email or password', 401);

  const token = signToken(user._id);
  return ok(res, { user: sanitize(user), token }, 'Logged in');
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  return ok(res, { user: sanitize(req.user) });
});

// PUT /api/auth/follow-match/:id
const toggleFollowMatch = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(req.user._id);
  const idx = user.followedMatches.indexOf(id);
  if (idx >= 0) user.followedMatches.splice(idx, 1);
  else user.followedMatches.push(id);
  await user.save();
  return ok(res, { followedMatches: user.followedMatches });
});

// PUT /api/auth/favorite-team/:team
const toggleFavoriteTeam = asyncHandler(async (req, res) => {
  const team = req.params.team;
  const user = await User.findById(req.user._id);
  const idx = user.favoriteTeams.indexOf(team);
  if (idx >= 0) user.favoriteTeams.splice(idx, 1);
  else user.favoriteTeams.push(team);
  await user.save();
  return ok(res, { favoriteTeams: user.favoriteTeams });
});

module.exports = { register, login, me, toggleFollowMatch, toggleFavoriteTeam };
