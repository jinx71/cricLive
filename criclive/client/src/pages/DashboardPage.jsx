import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { fetchLive, fetchUpcoming, fetchFinished } from '../api/cricket';
import { apiToggleFavoriteTeam } from '../api/auth';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import MatchCard from '../components/MatchCard';

const ALL_TEAMS = [
  'India', 'Australia', 'England', 'Pakistan', 'New Zealand', 'South Africa',
  'Sri Lanka', 'West Indies', 'Bangladesh', 'Afghanistan', 'Ireland', 'Zimbabwe',
];

const DashboardPage = () => {
  const { user, updateUser } = useAuth();

  const live = useQuery(['matches', 'live'], fetchLive, { staleTime: 20000 });
  const upcoming = useQuery(['matches', 'upcoming'], fetchUpcoming, { staleTime: 120000 });
  const finished = useQuery(['matches', 'finished'], fetchFinished, { staleTime: 120000 });

  const followedIds = new Set(user?.followedMatches || []);
  const favoriteTeams = new Set(user?.favoriteTeams || []);

  const followedMatches = useMemo(() => {
    const all = [
      ...(live.data?.data || []),
      ...(upcoming.data?.data || []),
      ...(finished.data?.data || []),
    ];
    const seen = new Set();
    return all.filter((m) => {
      if (!followedIds.has(m.id)) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [live.data, upcoming.data, finished.data, followedIds]);

  const favoriteMatches = useMemo(() => {
    const all = [
      ...(live.data?.data || []),
      ...(upcoming.data?.data || []),
    ];
    const seen = new Set();
    return all.filter((m) => {
      if (seen.has(m.id)) return false;
      const hits = (m.teams || []).some((t) => favoriteTeams.has(t));
      if (hits) {
        seen.add(m.id);
        return true;
      }
      return false;
    });
  }, [live.data, upcoming.data, favoriteTeams]);

  const loading = live.isLoading || upcoming.isLoading || finished.isLoading;

  const toggleTeam = async (team) => {
    try {
      const { data } = await apiToggleFavoriteTeam(team);
      updateUser({ favoriteTeams: data.favoriteTeams });
    } catch (err) {
      toast.error(err.message || 'Could not update');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Hi, {user?.name?.split(' ')[0] || 'cricket fan'} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Your followed matches and favorite teams.</p>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-lg font-bold text-slate-800">★ Followed matches</h2>
          <Badge tone="brand">{followedMatches.length}</Badge>
        </div>
        {loading ? (
          <Spinner label="Loading" />
        ) : followedMatches.length === 0 ? (
          <EmptyState
            title="No followed matches yet"
            message="Tap the star on any match to follow it."
            icon="⭐"
            action={
              <Link to="/">
                <Button variant="primary">Browse matches</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {followedMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-lg font-bold text-slate-800">🏴 Favorite teams</h2>
          <Badge tone="brand">{favoriteTeams.size}</Badge>
        </div>
        <Card className="p-5 mb-4">
          <p className="text-sm text-slate-500 mb-3">
            Pick teams to surface their matches at the top of your dashboard.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TEAMS.map((team) => {
              const active = favoriteTeams.has(team);
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => toggleTeam(team)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition border
                    ${
                      active
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                >
                  {active ? '★ ' : '☆ '}
                  {team}
                </button>
              );
            })}
          </div>
        </Card>

        {favoriteMatches.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Live & upcoming for your teams
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
