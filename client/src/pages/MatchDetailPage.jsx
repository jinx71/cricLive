import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { fetchMatch } from '../api/cricket';
import { apiToggleFollowMatch } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import TeamLine from '../components/TeamLine';
import CacheBadge from '../components/CacheBadge';
import { matchStatusBadge, formatDate, formatScore } from '../utils/format';

const BattingTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="text-left px-4 py-2 font-medium">Batter</th>
          <th className="text-right px-3 py-2 font-medium">R</th>
          <th className="text-right px-3 py-2 font-medium">B</th>
          <th className="text-right px-3 py-2 font-medium">4s</th>
          <th className="text-right px-3 py-2 font-medium">6s</th>
          <th className="text-right px-3 py-2 font-medium">SR</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="px-4 py-2.5">
              <div className="font-medium text-slate-800">
                {r.batsman?.name || r['batsman-name'] || r.name || '—'}
              </div>
              {r['dismissal-text'] && (
                <div className="text-xs text-slate-500 line-clamp-1">{r['dismissal-text']}</div>
              )}
            </td>
            <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-800">
              {r.r ?? 0}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.b ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r['4s'] ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r['6s'] ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.sr ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BowlingTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white mt-4">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="text-left px-4 py-2 font-medium">Bowler</th>
          <th className="text-right px-3 py-2 font-medium">O</th>
          <th className="text-right px-3 py-2 font-medium">M</th>
          <th className="text-right px-3 py-2 font-medium">R</th>
          <th className="text-right px-3 py-2 font-medium">W</th>
          <th className="text-right px-3 py-2 font-medium">Econ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="px-4 py-2.5 font-medium text-slate-800">
              {r.bowler?.name || r['bowler-name'] || r.name || '—'}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.o ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.m ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.r ?? 0}</td>
            <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-800">
              {r.w ?? 0}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-600">{r.eco ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InningPanel = ({ inning }) => {
  const batting = inning.batting || inning.batsmen || [];
  const bowling = inning.bowling || inning.bowlers || [];
  return (
    <Card className="p-4 sm:p-5 mb-5">
      <h3 className="font-display text-lg font-bold text-brand-800 mb-3">
        {inning.inning || 'Innings'}
      </h3>
      {batting.length > 0 ? (
        <BattingTable rows={batting} />
      ) : (
        <p className="text-sm text-slate-500">No batting data yet.</p>
      )}
      {bowling.length > 0 && <BowlingTable rows={bowling} />}
    </Card>
  );
};

const MatchDetailPage = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [view, setView] = useState('summary');
  const [follow, setFollow] = useState({ pending: false });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    ['match', id],
    () => fetchMatch(id),
    {
      // Live matches benefit from polling; a 30s interval is plenty since the cache
      // keeps the actual upstream pressure low.
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <Spinner label="Loading match" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ErrorState message={error?.message || 'Match not found.'} onRetry={() => refetch()} />
        <div className="text-center mt-4">
          <Link to="/" className="text-brand-700 hover:underline text-sm">
            ← Back to scores
          </Link>
        </div>
      </div>
    );
  }

  const match = data?.data;
  const meta = data?.meta;
  if (!match) {
    return <EmptyState title="Match not found" icon="🔍" />;
  }

  const status = matchStatusBadge(match);
  const [teamA, teamB] = match.teams || [];
  const infoA = (match.teamInfo || []).find((t) => t.name === teamA);
  const infoB = (match.teamInfo || []).find((t) => t.name === teamB);
  const scoreA = (match.score || []).find((s) => (s.inning || '').toLowerCase().includes((teamA || '').toLowerCase()));
  const scoreB = (match.score || []).find((s) => (s.inning || '').toLowerCase().includes((teamB || '').toLowerCase()));

  const innings = match.scorecard || [];
  const isFollowed = user?.followedMatches?.includes(match.id);

  const handleFollow = async () => {
    if (!user) {
      toast.info('Log in to follow matches.');
      return;
    }
    setFollow({ pending: true });
    try {
      const { data: res } = await apiToggleFollowMatch(match.id);
      updateUser({ followedMatches: res.followedMatches });
      toast.success(
        res.followedMatches.includes(match.id) ? 'Following this match' : 'Unfollowed'
      );
    } catch (err) {
      toast.error(err.message || 'Could not update');
    } finally {
      setFollow({ pending: false });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Back to scores
        </Link>
      </div>

      <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={status.tone} pulse={status.tone === 'live'}>
              {status.label}
            </Badge>
            {match.matchType && <Badge tone="white">{match.matchType}</Badge>}
            {meta && <CacheBadge meta={meta} />}
            {isFetching && <Badge tone="white">Refreshing…</Badge>}
          </div>
          <Button
            variant={isFollowed ? 'gold' : 'secondary'}
            size="sm"
            loading={follow.pending}
            onClick={handleFollow}
          >
            {isFollowed ? '★ Following' : '☆ Follow match'}
          </Button>
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold leading-tight">
          {match.name}
        </h1>
        {match.seriesName && (
          <p className="text-sm text-brand-100 mt-1">{match.seriesName}</p>
        )}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-brand-200">Venue: </span>
            <span className="font-medium">{match.venue || '—'}</span>
          </div>
          <div>
            <span className="text-brand-200">Date: </span>
            <span className="font-medium">{formatDate(match.date || match.dateTimeGMT)}</span>
          </div>
          {match.tossWinner && (
            <div>
              <span className="text-brand-200">Toss: </span>
              <span className="font-medium">
                {match.tossWinner} chose to {match.tossChoice}
              </span>
            </div>
          )}
          {match.matchWinner && (
            <div>
              <span className="text-brand-200">Winner: </span>
              <span className="font-bold text-accent-gold">{match.matchWinner}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 sm:p-5 mb-6">
        <div className="divide-y divide-slate-100">
          {teamA && <TeamLine team={teamA} info={infoA} score={scoreA} />}
          {teamB && <TeamLine team={teamB} info={infoB} score={scoreB} />}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-sm font-medium text-slate-700">
          {match.status || 'Match status unavailable.'}
        </div>
      </Card>

      <div className="mb-4 overflow-x-auto">
        <Tabs
          tabs={[
            { value: 'summary', label: 'Summary', icon: '📋' },
            { value: 'scorecard', label: 'Scorecard', icon: '🏏', count: innings.length || undefined },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === 'summary' && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Quick summary</h3>
          {(match.score || []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Innings haven't started yet. Check back closer to start time.
            </p>
          ) : (
            <ul className="space-y-2">
              {(match.score || []).map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
                >
                  <span className="font-medium text-slate-700">{s.inning}</span>
                  <span className="font-mono font-semibold text-brand-800">{formatScore(s)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {view === 'scorecard' && (
        <>
          {innings.length === 0 ? (
            <EmptyState
              title="No scorecard available"
              message="The detailed scorecard isn't published yet."
              icon="📋"
            />
          ) : (
            innings.map((i, idx) => <InningPanel key={idx} inning={i} />)
          )}
        </>
      )}
    </div>
  );
};

export default MatchDetailPage;
