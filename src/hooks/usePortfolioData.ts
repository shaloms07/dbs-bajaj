import { useQuery } from '@tanstack/react-query';
import { PortfolioKPIs, PortfolioChartData, fetchPortfolioKPIs, fetchPortfolioDistribution } from '../services/portfolioService';

export function usePortfolioData() {
  const kpis = useQuery<PortfolioKPIs, Error>({
    queryKey: ['portfolio', 'kpis'],
    queryFn: fetchPortfolioKPIs,
    staleTime: 2 * 60 * 1000
  });

  const distribution = useQuery<PortfolioChartData[], Error>({
    queryKey: ['portfolio', 'distribution'],
    queryFn: fetchPortfolioDistribution,
    staleTime: 2 * 60 * 1000
  });

  return { kpis, distribution };
}
