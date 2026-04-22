import { useQuery } from '@tanstack/react-query';
import { APILog, fetchAPILogs } from '../services/statusService';

export function useAPILogs() {
  return useQuery<APILog[], Error>({
    queryKey: ['api', 'logs'],
    queryFn: fetchAPILogs,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false
  });
}
