import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLive, fetchUpcoming, fetchFinished } from '../api/cricket';
import Tabs from '../components/Tabs';
import MatchCard from '../components/MatchCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import CacheBadge from '../components/CacheBadge';
import Badge from '../components/Badge';

const TABS = [
  { value: 'live', label: 'Live', icon: '🔴', fetcher: fetchLive, refetch: 20000, empty: 'No live matches right now.' },
  { value: 'upcoming', label: 'Upcoming', icon: '⏳', fetcher: fetchUpcoming, refetch: 120000, empty: 'No upcoming matches scheduled.' },
  { value: 'finished', label: 'Finished', icon: '✅', fetcher: fetchFinished, refetch: 0, empty: 'No recently finished matches.' },
];

const HomePage = () => {
  const [tab, setTab] = useState('live');
  const active = useMemo(() => TABS.find((t) => t.value === tab), [tab]);

  const query = useQuery(
    ['matches', tab],
    async () => {
      const res = await active.fetcher();
      return res;
    },
    {
      // Polling — the client is naive and just asks every N seconds.
      // The backend cache absorbs the load; very few of these actually hit the upstream.
      refetchInterval: active.refetch || false,
      refetchIntervalInBackground: false,
      keepPreviousData: true,
    }
  );

  const { data, isLoading, isError, error, refetch, isFetching } = query;
  const matches = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cricket scores
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Live updates polled every 20s — served from a backend cache that absorbs the rate-limited upstream.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {meta && <CacheBadge meta={meta} />}
          {isFetching && !isLoading && <Badge tone="slate">Refreshing…</Badge>}
        </div>
      </section>

      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={TABS.map((t) => ({ ...t }))} value={tab} onChange={setTab} />
      </div>

      {isLoading && (
        <div className="py-20">
          <Spinner label={`Loading ${active.label.toLowerCase()} matches`} />
        </div>
      )}

      {isError && (
        <ErrorState
          message={error?.message || 'Failed to load matches.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && matches.length === 0 && (
        <EmptyState title="Nothing to show" message={active.empty} icon={active.icon} />
      )}

      {!isLoading && !isError && matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
