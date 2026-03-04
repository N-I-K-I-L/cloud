import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import TemplateRenderer from '../components/TemplateRenderer';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/portfolios/public/${username}/`);
        setPortfolio(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load portfolio.');
      }
    };
    load();
  }, [username]);

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!portfolio) {
    return <div className="p-8">Loading public portfolio...</div>;
  }

  return <TemplateRenderer templateId={portfolio.template_id} data={portfolio.portfolio_data_json || {}} />;
}
