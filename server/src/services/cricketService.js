/**
 * Cricket service — the engineering core of CricLive.
 *
 * Lesson: caching around free-tier rate limits.
 *
 * - All upstream calls go through `cachedGet(key, ttl, fetcher)`. The fetcher is only
 *   invoked on a miss; hits are returned instantly. Inflight de-duplication is built in:
 *   if 20 clients ask for /matches/current while one upstream request is already running,
 *   they all await the same Promise. This is what lets the client poll aggressively
 *   without burning the upstream quota.
 * - Two clear failure modes are normal here:
 *     1. No API key in env  → mock mode, served from cricketMock.js.
 *     2. Upstream error / rate-limit → fall back to mock for that endpoint and tag
 *        the response so the controller can surface a banner to the UI.
 * - The shape returned to the controllers is normalized. The client never sees the
 *   raw CricAPI envelope — only `{ source: 'live' | 'cache' | 'mock', data, fetchedAt }`.
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const mock = require('./cricketMock');

const BASE_URL = process.env.CRICKETDATA_BASE_URL || 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKETDATA_API_KEY || '';

const TTL = {
  live: Number(process.env.CACHE_TTL_LIVE) || 20,
  matches: Number(process.env.CACHE_TTL_MATCHES) || 120,
  matchInfo: Number(process.env.CACHE_TTL_MATCH_INFO) || 60,
  series: Number(process.env.CACHE_TTL_SERIES) || 600,
  players: Number(process.env.CACHE_TTL_PLAYERS) || 86400,
};

// stdTTL = 0 → individual keys carry their own TTL via .set(k, v, ttl)
const cache = new NodeCache({ stdTTL: 0, checkperiod: 60, useClones: false });
const inflight = new Map();

const isMockMode = () => !API_KEY;

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

/**
 * Cached + de-duplicated GET.
 * Returns { source, data, fetchedAt } where source is 'cache' | 'live' | 'mock'.
 */
const cachedGet = async (key, ttl, fetcher, mockFn) => {
  const hit = cache.get(key);
  if (hit !== undefined) {
    return { source: 'cache', data: hit, fetchedAt: cache.getTtl(key) };
  }

  if (isMockMode()) {
    const data = mockFn();
    cache.set(key, data, ttl);
    return { source: 'mock', data, fetchedAt: Date.now() + ttl * 1000 };
  }

  // Inflight de-dup — many concurrent requests share one upstream call.
  if (inflight.has(key)) {
    const data = await inflight.get(key);
    return { source: 'live', data, fetchedAt: Date.now() + ttl * 1000 };
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      cache.set(key, data, ttl);
      return data;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, promise);

  try {
    const data = await promise;
    return { source: 'live', data, fetchedAt: Date.now() + ttl * 1000 };
  } catch (err) {
    console.warn(`[cricket] upstream failed for ${key} — falling back to mock:`, err.message);
    const data = mockFn();
    // Cache the fallback briefly so we don't hammer a failing upstream.
    cache.set(key, data, Math.min(ttl, 30));
    return { source: 'mock', data, fetchedAt: Date.now() + ttl * 1000, fallback: true };
  }
};

const upstream = async (path, params = {}) => {
  const { data } = await http.get(path, {
    params: { apikey: API_KEY, ...params },
  });
  if (data && data.status && /failure|error/i.test(data.status)) {
    throw new Error(data.reason || `Upstream returned status: ${data.status}`);
  }
  return data && data.data !== undefined ? data.data : data;
};

// ---------- Public API used by controllers ----------

const getCurrentMatches = () =>
  cachedGet(
    'matches:current',
    TTL.live,
    () => upstream('/currentMatches', { offset: 0 }),
    () => mock.MATCHES.filter((m) => m.matchStarted && !m.matchEnded)
  );

const getUpcomingMatches = () =>
  cachedGet(
    'matches:upcoming',
    TTL.matches,
    () => upstream('/matches', { offset: 0 }).then((rows) =>
      (rows || []).filter((m) => !m.matchStarted)
    ),
    () => mock.MATCHES.filter((m) => !m.matchStarted)
  );

const getFinishedMatches = () =>
  cachedGet(
    'matches:finished',
    TTL.matches,
    () => upstream('/matches', { offset: 0 }).then((rows) =>
      (rows || []).filter((m) => m.matchEnded)
    ),
    () => mock.MATCHES.filter((m) => m.matchEnded)
  );

const getMatchInfo = (id) =>
  cachedGet(
    `match:info:${id}`,
    TTL.matchInfo,
    () => upstream('/match_info', { id }),
    () => {
      const m = mock.MATCHES.find((x) => x.id === id);
      if (!m) return null;
      return { ...m, ...(mock.SCORECARDS[id] || { scorecard: [] }) };
    }
  );

const getSeriesList = () =>
  cachedGet(
    'series:list',
    TTL.series,
    () => upstream('/series', { offset: 0 }),
    () => mock.SERIES
  );

const getSeriesInfo = (id) =>
  cachedGet(
    `series:info:${id}`,
    TTL.series,
    () => upstream('/series_info', { id }),
    () => {
      const s = mock.SERIES.find((x) => x.id === id);
      if (!s) return null;
      return {
        info: s,
        matchList: mock.MATCHES.filter((m) => m.series_id === id),
      };
    }
  );

const getPointsTable = (id) =>
  cachedGet(
    `series:points:${id}`,
    TTL.series,
    () => upstream('/series_points', { id }),
    () => ({
      pointsTable: mock.POINTS_TABLE[id] || mock.POINTS_TABLE['icc-wtc-25'],
    })
  );

const searchPlayers = (q) =>
  cachedGet(
    `players:search:${(q || '').toLowerCase()}`,
    TTL.players,
    () => upstream('/players', { offset: 0, search: q }),
    () => {
      const needle = (q || '').toLowerCase();
      if (!needle) return mock.PLAYER_LIST;
      return mock.PLAYER_LIST.filter((p) => p.name.toLowerCase().includes(needle));
    }
  );

const getPlayerInfo = (id) =>
  cachedGet(
    `players:info:${id}`,
    TTL.players,
    () => upstream('/players_info', { id }),
    () => mock.PLAYERS[id] || mock.PLAYERS['mock-player-1']
  );

const getCacheStats = () => ({
  mockMode: isMockMode(),
  keys: cache.keys().length,
  hits: cache.getStats().hits,
  misses: cache.getStats().misses,
  ksize: cache.getStats().ksize,
  vsize: cache.getStats().vsize,
  ttls: TTL,
});

const clearCache = () => {
  cache.flushAll();
  return { cleared: true };
};

module.exports = {
  isMockMode,
  getCurrentMatches,
  getUpcomingMatches,
  getFinishedMatches,
  getMatchInfo,
  getSeriesList,
  getSeriesInfo,
  getPointsTable,
  searchPlayers,
  getPlayerInfo,
  getCacheStats,
  clearCache,
};
