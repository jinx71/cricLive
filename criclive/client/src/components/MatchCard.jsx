import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';
import TeamLine from './TeamLine';
import { matchStatusBadge, fromNow, formatDate } from '../utils/format';

const pickInning = (scores, teamName) => {
  if (!Array.isArray(scores)) return null;
  return scores.find((s) => (s.inning || '').toLowerCase().includes((teamName || '').toLowerCase()));
};

const MatchCard = ({ match }) => {
  const status = matchStatusBadge(match);
  const [teamA, teamB] = match.teams || [];
  const infoA = (match.teamInfo || []).find((t) => t.name === teamA);
  const infoB = (match.teamInfo || []).find((t) => t.name === teamB);
  const scoreA = pickInning(match.score, teamA);
  const scoreB = pickInning(match.score, teamB);

  return (
    <Link to={`/match/${match.id}`} className="block animate-fade-in">
      <Card interactive className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={status.tone} pulse={status.tone === 'live'}>
                {status.label}
              </Badge>
              {match.matchType && <Badge tone="brand">{match.matchType}</Badge>}
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 line-clamp-2">
              {match.name}
            </h3>
            {match.seriesName && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{match.seriesName}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500">
              {match.matchStarted ? fromNow(match.date) : formatDate(match.date)}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {teamA && <TeamLine team={teamA} info={infoA} score={scoreA} />}
          {teamB && <TeamLine team={teamB} info={infoB} score={scoreB} />}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 line-clamp-1">
          {match.status || (match.matchEnded ? 'Match ended' : 'Awaiting toss')}
        </div>

        {match.venue && (
          <div className="mt-1 text-xs text-slate-400 line-clamp-1">📍 {match.venue}</div>
        )}
      </Card>
    </Link>
  );
};

export default MatchCard;
