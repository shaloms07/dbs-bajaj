import { useQuery } from '@tanstack/react-query';
import { fetchVehicleTelemetry, TelemetryFilter, VehicleTelemetryData } from '../services/telemetryService';

export function useVehicleTelemetry(filter: TelemetryFilter) {
  return useQuery<VehicleTelemetryData, Error>({
    queryKey: ['vehicle-telemetry', filter.vehicleNumber, filter.bbid, filter.startDateTime, filter.endDateTime],
    queryFn: () => fetchVehicleTelemetry(filter),
    enabled: Boolean(filter.vehicleNumber && filter.bbid && filter.startDateTime && filter.endDateTime),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });
}
