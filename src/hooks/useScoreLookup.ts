import { useQuery } from '@tanstack/react-query';
import { fetchScore } from '../services/scoreService';
import { ScoreResult } from '../types/score';

export function useScoreLookup(regNo: string) {
  return useQuery<ScoreResult, Error>({
    queryKey: ['score', regNo],
    queryFn: () => fetchScore(regNo),
    staleTime: 5 * 60 * 1000,
    enabled: !!regNo
  });
}
