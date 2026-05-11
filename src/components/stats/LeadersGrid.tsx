import React from 'react';
import { useTranslation } from 'react-i18next';
import LeaderCard from './LeaderCard';
import type { LeagueLeaders, LeaderCategoryKey } from '../../lib/queries';

interface Props { leaders: LeagueLeaders }

interface CardDef {
  key: LeaderCategoryKey;
  labelKey: string;
  format?: (n: number) => string;
}

const ROW_PRIMARY: CardDef[] = [
  { key: 'ppg',         labelKey: 'stats.category_points' },
  { key: 'rpg',         labelKey: 'stats.category_rebounds' },
  { key: 'apg',         labelKey: 'stats.category_assists' },
  { key: 'eff',         labelKey: 'stats.category_efficiency' },
  { key: 'mpg',         labelKey: 'stats.category_minutes' },
];

const ROW_DEFENSE: CardDef[] = [
  { key: 'spg',         labelKey: 'stats.category_steals' },
  { key: 'bpg',         labelKey: 'stats.category_blocks' },
  { key: 'ft_pct',      labelKey: 'stats.category_ft_pct',  format: (n) => `${n.toFixed(1)}%` },
  { key: 'fg2_pct',     labelKey: 'stats.category_fg2_pct', format: (n) => `${n.toFixed(1)}%` },
  { key: 'fg3_pct',     labelKey: 'stats.category_fg3_pct', format: (n) => `${n.toFixed(1)}%` },
];

const ROW_SHOOTING: CardDef[] = [
  { key: 'ft_made_pg',  labelKey: 'stats.category_ft_made' },
  { key: 'fg2_made_pg', labelKey: 'stats.category_fg2_made' },
  { key: 'fg3_made_pg', labelKey: 'stats.category_fg3_made' },
];

const Row: React.FC<{ title: string; defs: CardDef[]; leaders: LeagueLeaders }> = ({ title, defs, leaders }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <div className="space-y-3" dir={dir}>
    <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {defs.map((d) => (
        <LeaderCard key={d.key} label={t(d.labelKey)} rows={leaders[d.key]} formatValue={d.format} />
      ))}
    </div>
  </div>
  );
};

const LeadersGrid: React.FC<Props> = ({ leaders }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-8">
    <Row title={t('stats.row_primary')} defs={ROW_PRIMARY} leaders={leaders} />
    <Row title={t('stats.row_defense')} defs={ROW_DEFENSE} leaders={leaders} />
    <Row title={t('stats.row_shooting')} defs={ROW_SHOOTING} leaders={leaders} />
  </div>
  );
};

export default LeadersGrid;
