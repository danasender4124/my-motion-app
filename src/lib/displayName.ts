import i18n from '../i18n';

const isEn = () => i18n.language === 'en';

export const teamName = (t: { name: string; name_en?: string | null } | null | undefined): string => {
  if (!t) return '—';
  return isEn() && t.name_en ? t.name_en : t.name;
};

export const playerFullName = (p: {
  first_name: string; last_name: string;
  first_name_en?: string | null; last_name_en?: string | null;
} | null | undefined): string => {
  if (!p) return '—';
  if (isEn() && (p.first_name_en || p.last_name_en)) {
    return [p.first_name_en, p.last_name_en].filter(Boolean).join(' ');
  }
  return `${p.first_name} ${p.last_name}`;
};
