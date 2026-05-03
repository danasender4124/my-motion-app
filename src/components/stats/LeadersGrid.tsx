import React from 'react';
import LeaderCard from './LeaderCard';
import type { LeagueLeaders, LeaderCategoryKey } from '../../lib/queries';

interface Props { leaders: LeagueLeaders }

interface CardDef {
  key: LeaderCategoryKey;
  label: string;
  format?: (n: number) => string;
}

const ROW_PRIMARY: CardDef[] = [
  { key: 'ppg',         label: 'נקודות' },
  { key: 'rpg',         label: 'ריבאונדים' },
  { key: 'apg',         label: 'אסיסטים' },
  { key: 'eff',         label: 'יעילות' },
  { key: 'mpg',         label: 'דקות משחק' },
];

const ROW_DEFENSE: CardDef[] = [
  { key: 'spg',         label: 'חטיפות' },
  { key: 'bpg',         label: 'חסימות' },
  { key: 'ft_pct',      label: '% מהעונשין', format: (n) => `${n.toFixed(1)}%` },
];

const ROW_SHOOTING: CardDef[] = [
  { key: 'fg2_pct',     label: '% מ-2', format: (n) => `${n.toFixed(1)}%` },
  { key: 'fg3_pct',     label: '% מ-3', format: (n) => `${n.toFixed(1)}%` },
  { key: 'ft_made_pg',  label: 'זריקות עונשין' },
  { key: 'fg2_made_pg', label: 'זריקות מ-2' },
  { key: 'fg3_made_pg', label: 'זריקות מ-3' },
];

const Row: React.FC<{ title: string; defs: CardDef[]; leaders: LeagueLeaders }> = ({ title, defs, leaders }) => (
  <div className="space-y-3" dir="rtl">
    <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {defs.map((d) => (
        <LeaderCard key={d.key} label={d.label} rows={leaders[d.key]} formatValue={d.format} />
      ))}
    </div>
  </div>
);

const LeadersGrid: React.FC<Props> = ({ leaders }) => (
  <div className="space-y-8">
    <Row title="ראשי" defs={ROW_PRIMARY} leaders={leaders} />
    <Row title="הגנה ושליטה" defs={ROW_DEFENSE} leaders={leaders} />
    <Row title="קליעות" defs={ROW_SHOOTING} leaders={leaders} />
  </div>
);

export default LeadersGrid;
