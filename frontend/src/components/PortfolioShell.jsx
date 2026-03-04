import React from 'react';

const styles = {
  minimal: 'bg-white text-slate-900',
  dark: 'bg-slate-900 text-slate-100',
  cards: 'bg-gradient-to-br from-cyan-50 to-orange-50 text-slate-900',
};

export default function PortfolioShell({ templateId, children }) {
  return (
    <div className={`min-h-screen ${styles[templateId] || styles.minimal}`}>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
