import React from 'react';

/**
 * Unified section heading for the whole site: heavy Heebo, tight tracking,
 * short orange accent bar. One voice everywhere instead of per-component
 * ad-hoc headers.
 */
const SectionTitle: React.FC<{ children: React.ReactNode; small?: boolean }> = ({ children, small }) => (
  <div className="flex items-center gap-3 mb-5">
    <span
      aria-hidden="true"
      style={{
        width: 5,
        alignSelf: 'stretch',
        background: 'linear-gradient(180deg, #FF4D00, #B33000)',
        borderRadius: 2,
      }}
    />
    <h2
      className="font-black leading-none"
      style={{
        color: '#F2EDE6',
        fontSize: small ? '1.15rem' : 'clamp(1.3rem, 2.4vw, 1.75rem)',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </h2>
  </div>
);

export default SectionTitle;
