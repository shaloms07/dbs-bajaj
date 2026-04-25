import { useQuery } from '@tanstack/react-query';
import { fetchScore } from '../services/scoreService';
import { ScoreResult } from '../types/score';

export function useScoreLookup(regNo: string, includeRc = false) {
  return useQuery<ScoreResult, Error>({
    queryKey: ['score', regNo, includeRc],
    queryFn: () => fetchScore(regNo, includeRc),
    staleTime: 5 * 60 * 1000,
    enabled: !!regNo
  });
}
