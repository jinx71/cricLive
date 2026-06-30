import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchSeriesInfo } from '../api/cricket';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import MatchCard from '../components/MatchCard';
import CacheBadge from '../components/CacheBadge';
import { formatDate } from '../utils/format';

const SeriesDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['series', id],
    () => fetchSeriesInfo(id)
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <Spinner label="Loading series" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ErrorState message={error?.message || 'Failed to load series.'} onRetry={() => refetch()} />
      </div>
    );
  }

  const payload = data?.data;
  const info = payload?.info || payload;
  const matchList = payload?.matchList || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <Link to="/series" className="text-sm text-brand-700 hover:underline">
          ← All series
        </Link>
      </div>

      <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {Number(info?.test) > 0 && <Badge tone="white">{info.test} Test</Badge>}
          {Number(info?.odi) > 0 && <Badge tone="white">{info.odi} ODI</Badge>}
          {Number(info?.t20) > 0 && <Badge tone="white">{info.t20} T20</Badge>}
          {data?.meta && <CacheBadge meta={data.meta} />}
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold">
          {info?.name || 'Series'}
        </h1>
        <div className="mt-3 text-sm text-brand-100 flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="text-brand-200">Starts:</span> {formatDate(info?.startDate)}
          </span>
          <span>
            <span className="text-brand-200">Ends:</span> {formatDate(info?.endDate)}
          </span>
          {info?.squads && (
            <span>
              <span className="text-brand-200">Squads:</span> {info.squads}
            </span>
          )}
        </div>
        <div className="mt-4">
          <Link
            to={`/points/${info?.id || id}`}
            className="inline-flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-lg bg-accent-gold text-brand-900 font-semibold hover:brightness-95 transition"
          >
            📊 View points table
          </Link>
        </div>
      </Card>

      <h2 className="font-display text-lg font-bold text-slate-800 mb-3">Matches</h2>
      {matchList.length === 0 ? (
        <EmptyState
          title="No matches yet"
          message="Match list for this series isn't available."
          icon="🏏"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matchList.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesDetailPage;
