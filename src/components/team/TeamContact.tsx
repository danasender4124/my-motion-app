import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamProfile } from '../../lib/queries';
import SectionTitle from '../ui/SectionTitle';

interface Props { team: TeamProfile }

const SocialIcon: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
    style={{ background: 'rgba(255,255,255,0.06)', color: '#F2EDE6' }}
  >
    {children}
  </a>
);

const TeamContact: React.FC<Props> = ({ team }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const c = team.contact ?? {};
  const s = team.social_links ?? {};
  const hasContact = c.phone || c.email;
  const hasSocial = s.facebook || s.instagram || s.youtube || s.twitter;
  const hasVenue = team.hall_address;
  if (!hasContact && !hasSocial && !hasVenue) return null;

  return (
    <div dir={dir}>
      <SectionTitle>{t('team.contact')}</SectionTitle>
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {hasVenue && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>{t('team.hall')}:</span>
            <span className="text-sm" style={{ color: '#F2EDE6' }}>{team.hall_address}</span>
          </div>
        )}
        {c.phone && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>{t('team.phone')}:</span>
            <a href={`tel:${c.phone}`} className="text-sm" style={{ color: '#F2EDE6' }} dir="ltr">{c.phone}</a>
          </div>
        )}
        {c.email && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>{t('team.email')}:</span>
            <a href={`mailto:${c.email}`} className="text-sm" style={{ color: '#FF4D00' }} dir="ltr">{c.email}</a>
          </div>
        )}
        {hasSocial && (
          <div className="flex items-center gap-2 pt-2">
            {s.facebook  && <SocialIcon href={s.facebook}  label="Facebook">f</SocialIcon>}
            {s.instagram && <SocialIcon href={s.instagram} label="Instagram">IG</SocialIcon>}
            {s.youtube   && <SocialIcon href={s.youtube}   label="YouTube">YT</SocialIcon>}
            {s.twitter   && <SocialIcon href={s.twitter}   label="Twitter">X</SocialIcon>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamContact;
