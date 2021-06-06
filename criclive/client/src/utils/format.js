import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatScore = (score) => {
  if (!score) return '–';
  const { r, w, o } = score;
  return `${r ?? 0}/${w ?? 0} (${o ?? 0} ov)`;
};

export const formatDate = (iso) => {
  if (!iso) return '';
  return dayjs(iso).format('DD MMM YYYY, HH:mm');
};

export const fromNow = (iso) => {
  if (!iso) return '';
  return dayjs(iso).fromNow();
};

export const matchStatusBadge = (m) => {
  if (m.matchEnded) return { label: 'Finished', tone: 'slate' };
  if (m.matchStarted) return { label: 'LIVE', tone: 'live' };
  return { label: 'Upcoming', tone: 'brand' };
};

export const teamShort = (team) => {
  if (!team) return '';
  return team
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};
