import React from 'react';
import MinimalTemplate from '../templates/MinimalTemplate';
import DarkTemplate from '../templates/DarkTemplate';
import CardTemplate from '../templates/CardTemplate';
import TerminalTemplate from '../templates/TerminalTemplate';
import { RoboticTemplate } from '../templates/RoboticTemplate';
import PortfolioShell from './PortfolioShell';

export default function TemplateRenderer({ templateId, data }) {
  const renderMap = {
    minimal: <MinimalTemplate data={data} />,
    dark: <DarkTemplate data={data} />,
    cards: <CardTemplate data={data} />,
    terminal: <TerminalTemplate data={data} />,
    robotic: <RoboticTemplate data={data} />,
  };

  return <PortfolioShell templateId={templateId}>{renderMap[templateId] || renderMap.minimal}</PortfolioShell>;
}
