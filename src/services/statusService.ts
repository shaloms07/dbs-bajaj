export interface APIStatusResponse {
  uptime: number;
  avgResponseMs: number;
  callsToday: number;
}

export interface APILog {
  timestamp: string;
  regNo: string;
  endpoint: string;
  status: number;
  responseMs: number;
}

export async function fetchAPIStatus(): Promise<APIStatusResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return { uptime: 99.8, avgResponseMs: 310, callsToday: 2862 };
}

export async function fetchAPILogs(): Promise<APILog[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return [
    { timestamp: '09:43:12', regNo: 'MH31AB1234', endpoint: '/v1/score', status: 200, responseMs: 350 },
    { timestamp: '09:41:47', regNo: 'UP32CD5678', endpoint: '/v1/score', status: 200, responseMs: 430 },
    { timestamp: '09:37:35', regNo: 'KA01MN3456', endpoint: '/v1/score', status: 404, responseMs: 310 }
  ];
}
