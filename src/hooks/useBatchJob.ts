type BatchStatusResponse = {
  status: 'idle' | 'processing' | 'complete' | 'failed';
  processed: number;
  total: number;
};

export function useBatchJob(_batchId: string) {
  return {
    data: {
      status: 'idle',
      processed: 0,
      total: 0
    } as BatchStatusResponse
  };
}
