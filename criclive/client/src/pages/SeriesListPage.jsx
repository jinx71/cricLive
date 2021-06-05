import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSeriesList } from '../api/cricket';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CacheBadge from '../components/CacheBadge';
import { formatDate } from '../utils/format';

const SeriesListPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useQuery(['series-list'], fetchSeriesList);

  const filtered = useMemo(() => {
    const all = data?.data || [];
    if (!search.trim()) return all;
    const needle = search.toLowerCase();
    return all.filter((s) => (s.name || '').toLowerCase().includes(needle));
  }, [data, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cricket series
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Tournaments and bilateral series, cached server-side for 10 minutes.
          </p>
        </div>
        {data?.meta && <CacheBadge meta={data.meta} />}
      </section>

      <div className="mb-5">
        <Input
          placeholder="Search series by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="py-20">
          <Spinner label="Loading series" />
        </div>
      )}
      {isError && (
        <ErrorState message={error?.message || 'Failed to load series.'} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="No series found"
          message={search ? 'Try a different search term.' : 'No series available right now.'}
          icon="🏆"
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.id} to={`/series/${s.id}`} className="block animate-fade-in">
              <Card interactive className="p-5 h-full">
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-3">{s.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Number(s.test) > 0 && <Badge tone="brand">{s.test} Test</Badge>}
                  {Number(s.odi) > 0 && <Badge tone="pitch">{s.odi} ODI</Badge>}
                  {Number(s.t20) > 0 && <Badge tone="gold">{s.t20} T20</Badge>}
                  {!s.test && !s.odi && !s.t20 && Number(s.matches) > 0 && (
                    <Badge tone="slate">{s.matches} matches</Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>
                    <span className="text-slate-400">Starts:</span> {formatDate(s.startDate)}
                  </div>
                  <div>
                    <span className="text-slate-400">Ends:</span> {formatDate(s.endDate)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesListPage;
