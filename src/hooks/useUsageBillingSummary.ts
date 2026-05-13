import { useQuery } from '@tanstack/react-query';
import { fetchUsageBillingSummary, UsageBillingSummaryResponse } from '../services/usageBillingService';

export function useUsageBillingSummary() {
  return useQuery<UsageBillingSummaryResponse, Error>({
    queryKey: ['usage-billing', 'summary'],
    queryFn: fetchUsageBillingSummary,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}
