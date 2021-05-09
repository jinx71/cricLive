import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL,
  timeout: 12000,
});

// Inject JWT from localStorage on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('criclive_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap our standard envelope, throw on failure.
const unwrap = (res) => {
  // Some endpoints attach { meta } at the top level — preserve when present.
  if (res?.data && typeof res.data === 'object' && 'success' in res.data) {
    if (!res.data.success) {
      const err = new Error(res.data.message || 'Request failed');
      err.errors = res.data.errors;
      throw err;
    }
    return { data: res.data.data, meta: res.data.meta || null, message: res.data.message };
  }
  return { data: res.data, meta: null };
};

const handleError = (err) => {
  if (err.response && err.response.data) {
    const e = new Error(err.response.data.message || err.message);
    e.status = err.response.status;
    e.errors = err.response.data.errors || [];
    throw e;
  }
  throw err;
};

export const get = async (url, config) => {
  try {
    return unwrap(await client.get(url, config));
  } catch (err) {
    return handleError(err);
  }
};

export const post = async (url, body, config) => {
  try {
    return unwrap(await client.post(url, body, config));
  } catch (err) {
    return handleError(err);
  }
};

export const put = async (url, body, config) => {
  try {
    return unwrap(await client.put(url, body, config));
  } catch (err) {
    return handleError(err);
  }
};

export const del = async (url, config) => {
  try {
    return unwrap(await client.delete(url, config));
  } catch (err) {
    return handleError(err);
  }
};

export default client;
