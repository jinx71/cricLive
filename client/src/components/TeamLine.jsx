import React from 'react';
import { teamShort, formatScore } from '../utils/format';

const TeamLogo = ({ team, info }) => {
  const img = info?.img;
  const code = info?.shortname || teamShort(team);
  if (img) {
    return (
      <img
        src={img}
        alt={team}
        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 bg-slate-50"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold text-sm flex items-center justify-center ring-1 ring-brand-200">
      {code}
    </div>
  );
};

const TeamLine = ({ team, info, score }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="flex items-center gap-3 min-w-0">
      <TeamLogo team={team} info={info} />
      <span className="font-semibold text-slate-800 truncate">{team}</span>
    </div>
    <div className="text-right font-mono text-sm text-slate-700 whitespace-nowrap">
      {formatScore(score)}
    </div>
  </div>
);

export default TeamLine;
