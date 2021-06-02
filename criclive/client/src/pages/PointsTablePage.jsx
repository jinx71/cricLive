import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPointsTable } from '../api/cricket';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CacheBadge from '../components/CacheBadge';

const PointsTablePage = () => {
  const params = useParams();
  const id = params.id || 'icc-wtc-25';

  const { data, isLoading, isError, error, refetch } = useQuery(
    ['points', id],
    () => fetchPointsTable(id)
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <Spinner label="Loading standings" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ErrorState
          message={error?.message || 'Failed to load points table.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const rows = data?.data?.pointsTable || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <Link to="/series" className="text-sm text-brand-700 hover:underline">
          ← All series
        </Link>
        {data?.meta && <CacheBadge meta={data.meta} />}
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
        Standings
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Points table — cached for 10 minutes since it changes slowly.
      </p>

      {rows.length === 0 ? (
        <EmptyState title="No standings available" icon="📊" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50 text-brand-800">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">#</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Team</th>
                <th className="px-2 sm:px-3 py-3 text-right font-semibold">M</th>
                <th className="px-2 sm:px-3 py-3 text-right font-semibold">W</th>
                <th className="px-2 sm:px-3 py-3 text-right font-semibold">L</th>
                <th className="px-2 sm:px-3 py-3 text-right font-semibold">D/NR</th>
                <th className="px-2 sm:px-3 py-3 text-right font-semibold">NRR</th>
                <th className="px-3 sm:px-4 py-3 text-right font-bold">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={r.team || i} className="hover:bg-slate-50 transition">
                  <td className="px-3 sm:px-4 py-3 font-mono text-slate-500">{i + 1}</td>
                  <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800">
                    {r.team || r.teamname || r.name}
                    {r.shortname && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">
                        {r.shortname}
                      </span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-right font-mono">{r.matches ?? '—'}</td>
                  <td className="px-2 sm:px-3 py-3 text-right font-mono text-emerald-700">
                    {r.wins ?? '—'}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-right font-mono text-red-700">
                    {r.loss ?? '—'}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-right font-mono text-slate-600">
                    {(r.draw ?? 0) + (r.no_result ?? 0) + (r.ties ?? 0)}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-right font-mono text-slate-600">
                    {r.net_run_rate ?? '—'}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-mono font-bold text-brand-800">
                    {r.points ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default PointsTablePage;
