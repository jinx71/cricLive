import { get } from './client';

export const fetchLive = () => get('/cricket/matches/live');
export const fetchUpcoming = () => get('/cricket/matches/upcoming');
export const fetchFinished = () => get('/cricket/matches/finished');
export const fetchMatch = (id) => get(`/cricket/matches/${id}`);
export const fetchSeriesList = () => get('/cricket/series');
export const fetchSeriesInfo = (id) => get(`/cricket/series/${id}`);
export const fetchPointsTable = (id) => get(`/cricket/series/${id}/points`);
export const fetchDefaultPoints = () => get('/cricket/points');
export const searchPlayers = (q) => get(`/cricket/players?q=${encodeURIComponent(q || '')}`);
export const fetchPlayer = (id) => get(`/cricket/players/${id}`);
export const fetchCacheStats = () => get('/cricket/cache/stats');
