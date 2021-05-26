import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { fetchCacheStats } from '../api/cricket';
import { del } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

const StatRow = ({ label, value, mono = true }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`${mono ? 'font-mono' : ''} font-semibold text-slate-800`}>{value}</span>
  </div>
);

const CacheDiagnosticsPage = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    ['cache-stats'],
    fetchCacheStats,
    { refetchInterval: 5000 }
  );

  const flush = async () => {
    try {
      await del('/cricket/cache');
      toast.success('Cache flushed — next requests will hit upstream.');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Flush failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Cache diagnostics
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Live view of the in-process <code className="px-1.5 py-0.5 rounded bg-slate-100 text-brand-700">node-cache</code>
          {' '}layer that absorbs upstream pressure.
        </p>
      </section>

      <Card className="p-5 sm:p-6 mb-5">
        <h2 className="font-display font-bold text-brand-800 mb-2">📚 The engineering lesson</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          CricketData.org's free tier allows a small number of requests per day. Every client request,
          if proxied naively, would hit that ceiling in minutes. Here, the Express server caches each
          upstream response with a TTL tuned to how fast that data actually changes — 20s for live scores,
          2m for fixture lists, 10m for series info, 24h for player profiles. Inflight de-duplication
          means that even under heavy concurrent load only <em>one</em> upstream call goes out per cache key.
          If the upstream errors or rate-limits, the service falls back to a deterministic mock dataset
          and tags the response so the UI can show a "fallback" badge.
        </p>
      </Card>

      {isLoading && (
        <div className="py-10">
          <Spinner label="Loading stats" />
        </div>
      )}

      {isError && (
        <ErrorState message={error?.message || 'Failed to load stats.'} onRetry={() => refetch()} />
      )}

      {data?.data && (
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display font-bold text-slate-800">Live stats</h2>
            <div className="flex items-center gap-2">
              {isFetching && <Badge tone="slate">Refreshing…</Badge>}
              {data.data.mockMode && <Badge tone="gold">Mock mode</Badge>}
              <Button variant="danger" size="sm" onClick={flush}>
                Flush cache
              </Button>
            </div>
          </div>

          <div>
            <StatRow label="Mock mode (no API key)" value={String(data.data.mockMode)} mono={false} />
            <StatRow label="Cached keys" value={data.data.keys} />
            <StatRow label="Hits (lifetime)" value={data.data.hits} />
            <StatRow label="Misses (lifetime)" value={data.data.misses} />
            <StatRow
              label="Hit ratio"
              value={
                data.data.hits + data.data.misses === 0
                  ? '—'
                  : `${Math.round((data.data.hits / (data.data.hits + data.data.misses)) * 100)}%`
              }
            />
            <StatRow label="Key memory (bytes)" value={data.data.ksize} />
            <StatRow label="Value memory (bytes)" value={data.data.vsize} />
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">TTL configuration (seconds)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(data.data.ttls || {}).map(([k, v]) => (
                <div key={k} className="p-3 bg-brand-50 rounded-lg">
                  <div className="text-xs text-brand-600 uppercase tracking-wide">{k}</div>
                  <div className="font-mono font-bold text-brand-900">{v}s</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CacheDiagnosticsPage;
