import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayer } from '../api/cricket';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CacheBadge from '../components/CacheBadge';

// Group flat CricAPI stats into table rows keyed by matchtype.
const groupStats = (stats = []) => {
  const byType = {};
  for (const s of stats) {
    const fn = (s.fn || '').toLowerCase();
    const mt = s.matchtype || 'Other';
    if (!byType[mt]) byType[mt] = { batting: {}, bowling: {} };
    if (fn === 'batting') byType[mt].batting[s.stat] = s.value;
    else if (fn === 'bowling') byType[mt].bowling[s.stat] = s.value;
  }
  return byType;
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-mono font-semibold text-slate-800">{value ?? '—'}</span>
  </div>
);

const StatBlock = ({ title, stats, kind }) => {
  const fields =
    kind === 'batting'
      ? [
          ['m', 'Matches'],
          ['runs', 'Runs'],
          ['avg', 'Average'],
          ['sr', 'Strike rate'],
          ['100', '100s'],
          ['50', '50s'],
          ['hs', 'High score'],
        ]
      : [
          ['m', 'Matches'],
          ['wkts', 'Wickets'],
          ['avg', 'Average'],
          ['eco', 'Economy'],
          ['sr', 'Strike rate'],
          ['5w', '5-wicket hauls'],
          ['bbi', 'Best (innings)'],
        ];
  const hasAny = fields.some(([k]) => stats?.[k] !== undefined);
  if (!hasAny) return null;
  return (
    <div>
      <h4 className="font-semibold text-brand-800 text-sm mb-2">{title}</h4>
      <div className="divide-y divide-slate-100">
        {fields.map(([k, label]) => (
          <StatRow key={k} label={label} value={stats?.[k]} />
        ))}
      </div>
    </div>
  );
};

const PlayerDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['player', id],
    () => fetchPlayer(id)
  );

  const p = data?.data;
  const grouped = useMemo(() => groupStats(p?.stats || []), [p]);

  if (isLoading) {
    return (
      <div className="py-20">
        <Spinner label="Loading player" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ErrorState message={error?.message || 'Failed to load player.'} onRetry={() => refetch()} />
      </div>
    );
  }
  if (!p) return <EmptyState title="Player not found" icon="🧢" />;

  const types = Object.keys(grouped);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <Link to="/players" className="text-sm text-brand-700 hover:underline">
          ← All players
        </Link>
      </div>

      <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            {(p.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {p.country && <Badge tone="white">{p.country}</Badge>}
              {p.role && <Badge tone="gold">{p.role}</Badge>}
              {data?.meta && <CacheBadge meta={data.meta} />}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold">{p.name}</h1>
            <div className="mt-2 text-sm text-brand-100 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6">
              {p.battingStyle && (
                <div>
                  <span className="text-brand-200">Batting:</span> {p.battingStyle}
                </div>
              )}
              {p.bowlingStyle && (
                <div>
                  <span className="text-brand-200">Bowling:</span> {p.bowlingStyle}
                </div>
              )}
              {p.placeOfBirth && (
                <div>
                  <span className="text-brand-200">Born:</span> {p.placeOfBirth}
                </div>
              )}
              {p.dateOfBirth && (
                <div>
                  <span className="text-brand-200">DOB:</span> {p.dateOfBirth}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <h2 className="font-display text-lg font-bold text-slate-800 mb-3">Career stats</h2>

      {types.length === 0 ? (
        <EmptyState title="No stats available" icon="📈" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((mt) => (
            <Card key={mt} className="p-5">
              <Badge tone="brand" className="mb-3">
                {mt}
              </Badge>
              <div className="space-y-4">
                <StatBlock title="Batting" stats={grouped[mt].batting} kind="batting" />
                <StatBlock title="Bowling" stats={grouped[mt].bowling} kind="bowling" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerDetailPage;
