import { get, post, put } from './client';

export const apiRegister = (payload) => post('/auth/register', payload);
export const apiLogin = (payload) => post('/auth/login', payload);
export const apiMe = () => get('/auth/me');
export const apiToggleFollowMatch = (id) => put(`/auth/follow-match/${id}`);
export const apiToggleFavoriteTeam = (team) => put(`/auth/favorite-team/${encodeURIComponent(team)}`);
