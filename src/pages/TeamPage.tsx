import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTeam, useTeamRoster, useTeamGames, useTeamSeasonStats, useTeamLeaders } from '../lib/queries';
import TeamHeader from '../components/team/TeamHeader';
import TeamRoster from '../components/team/TeamRoster';
import TeamLeaders from '../components/team/TeamLeaders';
import TeamCoachStaff from '../components/team/TeamCoachStaff';
import TeamManagement from '../components/team/TeamManagement';
import TeamLatestPosts from '../components/team/TeamLatestPosts';
import TeamSchedule from '../components/team/TeamSchedule';
import TeamContact from '../components/team/TeamContact';

const TeamPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { id } = useParams<{ id: string }>();
  const teamQ = useTeam(id);
  const rosterQ = useTeamRoster(id);
  const gamesQ = useTeamGames(id);
  const statsQ = useTeamSeasonStats(id);
  const leadersQ = useTeamLeaders(id);

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
    <main className="max-w-5xl mx-auto px-6 md:px-12 pt-12 pb-16 space-y-10" style={{ background: '#07080C' }}>
      <TeamHeader team={team} stats={statsQ.data ?? null} />
      {leadersQ.data && <TeamLeaders leaders={leadersQ.data} />}
      <TeamCoachStaff teamId={team.id} />
      <TeamManagement teamId={team.id} />
      <TeamLatestPosts teamId={team.id} />
      <TeamRoster players={rosterQ.data ?? []} />
      <TeamSchedule games={gamesQ.data ?? []} teamId={team.id} />
      <TeamContact team={team} />
    </main>
  );
};

export default TeamPage;
