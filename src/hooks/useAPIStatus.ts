import { useQuery } from '@tanstack/react-query';
import { APIStatusResponse, fetchAPIStatus } from '../services/statusService';

export function useAPIStatus() {
  return useQuery<APIStatusResponse, Error>({
    queryKey: ['api', 'status'],
    queryFn: fetchAPIStatus,
    staleTime: 30 * 1000
  });
}
