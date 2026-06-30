import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { searchPlayers } from '../api/cricket';
import Card from '../components/Card';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CacheBadge from '../components/CacheBadge';

const useDebounced = (value, ms = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
};

const PlayersPage = () => {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 400);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    ['players', debouncedQ],
    () => searchPlayers(debouncedQ),
    { keepPreviousData: true }
  );

  const players = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Players
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Search by name. Results cached for 24 hours.
          </p>
        </div>
        {data?.meta && <CacheBadge meta={data.meta} />}
      </section>

      <div className="mb-5">
        <Input
          placeholder="Search players… e.g. Kohli, Root, Cummins"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {(isLoading || isFetching) && (
        <div className="py-10">
          <Spinner label="Searching" />
        </div>
      )}

      {isError && (
        <ErrorState message={error?.message || 'Search failed.'} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && players.length === 0 && (
        <EmptyState
          title="No players found"
          message={q ? 'Try a different name.' : 'Type to search.'}
          icon="🧢"
        />
      )}

      {!isLoading && !isError && players.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <Link key={p.id} to={`/players/${p.id}`} className="block animate-fade-in">
              <Card interactive className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center">
                  {(p.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.country || '—'}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
