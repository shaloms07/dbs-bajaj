import { useQuery } from '@tanstack/react-query';
import { fetchRecentVehicles, RecentVehicleItem } from '../services/recentVehiclesService';

export function useRecentVehicles() {
  return useQuery<RecentVehicleItem[], Error>({
    queryKey: ['usage', 'recent-vehicles'],
    queryFn: fetchRecentVehicles,
    staleTime: 60 * 1000
  });
}
