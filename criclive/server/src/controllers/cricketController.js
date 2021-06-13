const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const svc = require('../services/cricketService');

// Wraps service response into our envelope, surfacing cache metadata.
const send = (res, payload) => {
  const { source, data, fetchedAt, fallback } = payload;
  return res.status(200).json({
    success: true,
    data,
    message: null,
    meta: { source, fetchedAt, fallback: !!fallback, mockMode: svc.isMockMode() },
  });
};

const live = asyncHandler(async (_req, res) => send(res, await svc.getCurrentMatches()));
const upcoming = asyncHandler(async (_req, res) => send(res, await svc.getUpcomingMatches()));
const finished = asyncHandler(async (_req, res) => send(res, await svc.getFinishedMatches()));

const matchInfo = asyncHandler(async (req, res) => {
  const payload = await svc.getMatchInfo(req.params.id);
  if (!payload.data) return fail(res, 'Match not found', 404);
  return send(res, payload);
});

const seriesList = asyncHandler(async (_req, res) => send(res, await svc.getSeriesList()));

const seriesInfo = asyncHandler(async (req, res) => {
  const payload = await svc.getSeriesInfo(req.params.id);
  if (!payload.data) return fail(res, 'Series not found', 404);
  return send(res, payload);
});

const pointsTable = asyncHandler(async (req, res) => {
  const id = req.params.id || 'icc-wtc-25';
  return send(res, await svc.getPointsTable(id));
});

const searchPlayers = asyncHandler(async (req, res) =>
  send(res, await svc.searchPlayers(req.query.q || ''))
);

const playerInfo = asyncHandler(async (req, res) => {
  const payload = await svc.getPlayerInfo(req.params.id);
  if (!payload.data) return fail(res, 'Player not found', 404);
  return send(res, payload);
});

const cacheStats = asyncHandler(async (_req, res) => ok(res, svc.getCacheStats()));
const cacheFlush = asyncHandler(async (_req, res) => ok(res, svc.clearCache(), 'Cache cleared'));

module.exports = {
  live,
  upcoming,
  finished,
  matchInfo,
  seriesList,
  seriesInfo,
  pointsTable,
  searchPlayers,
  playerInfo,
  cacheStats,
  cacheFlush,
};
