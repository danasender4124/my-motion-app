import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useTeam, useTeamRoster, useTeamGames, useTeamSeasonStats, useTeamLeaders,
  useTeamSeasons, pickDefaultSeasonId,
} from '../lib/queries';
import TeamHeader from '../components/team/TeamHeader';
import TeamRoster from '../components/team/TeamRoster';
import TeamLeaders from '../components/team/TeamLeaders';
import TeamCoachStaff from '../components/team/TeamCoachStaff';
import TeamManagement from '../components/team/TeamManagement';
import TeamLatestPosts from '../components/team/TeamLatestPosts';
import TeamSchedule from '../components/team/TeamSchedule';
import TeamContact from '../components/team/TeamContact';
import SeasonPicker from '../components/ui/SeasonPicker';

const TeamPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { id } = useParams<{ id: string }>();

  // Season selector — seasons this team took part in, default the latest with data.
  const { data: teamSeasons = [] } = useTeamSeasons(id);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const defaultSeasonId = pickDefaultSeasonId(teamSeasons);
  useEffect(() => {
    if (!seasonId && defaultSeasonId) setSeasonId(defaultSeasonId);
  }, [defaultSeasonId, seasonId]);
  // The win/loss/rank strip mirrors the pinned league table, which only exists
  // for the current season — hide it when viewing an archived season.
  const isCurrentSeason = !!seasonId && seasonId === defaultSeasonId;

  const teamQ = useTeam(id);
  const rosterQ = useTeamRoster(id, seasonId);
  const gamesQ = useTeamGames(id, seasonId);
  const statsQ = useTeamSeasonStats(id);
  const leadersQ = useTeamLeaders(id, seasonId);

  if (teamQ.isLoading) {
    return (
      <div className="text-center py-24" style={{ color: 'rgba(242,237,230,0.4)' }} dir={dir}>
        {t('common.loading')}
      </div>
    );
  }
  if (!teamQ.data) {
    return (
      <div className="text-center py-24 space-y-4" dir={dir}>
        <div style={{ color: 'rgba(242,237,230,0.4)' }}>{t('team.not_found')}</div>
        <Link to="/standings" style={{ color: '#FF4D00' }}>{t('team.back_to_standings')}</Link>
      </div>
    );
  }
  const team = teamQ.data;

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 pt-4 pb-16 space-y-6" style={{ background: '#07080C' }}>
      {teamSeasons.length > 1 && (
        <div className="flex justify-end">
          <SeasonPicker
            seasons={teamSeasons}
            value={seasonId}
            onChange={setSeasonId}
            placeholder={t('team.pick_season')}
            label={t('team.season_label')}
            align="end"
          />
        </div>
      )}
      <TeamHeader team={team} stats={isCurrentSeason ? (statsQ.data ?? null) : null} />

      {/* Two-column body (desktop): news strip pinned to the inline-start
          (right in RTL) column, everything else in the wide column.
          On mobile it collapses to one column: roster → games → the rest → news. */}
      <div className="lg:grid lg:gap-6" style={{ gridTemplateColumns: '230px minmax(0, 1fr)' }}>
        <div className="space-y-6 lg:col-start-2 lg:row-start-1">
          <TeamRoster players={rosterQ.data ?? []} />
          <TeamSchedule games={gamesQ.data ?? []} teamId={team.id} />
          {leadersQ.data && <TeamLeaders leaders={leadersQ.data} />}
          <TeamCoachStaff teamId={team.id} />
          <TeamManagement teamId={team.id} />
          <TeamContact team={team} />
        </div>
        <aside className="mt-6 lg:mt-0 lg:col-start-1 lg:row-start-1">
          <div className="lg:sticky" style={{ top: 210 }}>
            <TeamLatestPosts teamId={team.id} compact />
          </div>
        </aside>
      </div>
    </main>
  );
};

export default TeamPage;
