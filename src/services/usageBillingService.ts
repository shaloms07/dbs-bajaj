import { useAuthStore } from '../store/authStore';
import { apiFetch } from './apiClient';

const DEFAULT_API_BASE_URL = 'https://api.dbscore.in/';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface UsageBillingBucketItem {
  period_start: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
}

export interface UsageBillingRiskItem {
  risk_level: string;
  request_count: number;
}

export interface UsageBillingWindow {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  risk_category_distribution: UsageBillingRiskItem[];
  summary_sentence: string;
  daily_request_counts: UsageBillingBucketItem[];
  monthly_request_counts: UsageBillingBucketItem[];
}

export interface UsageBillingSummaryResponse {
  request_success_rate_pct: number;
  total_calls_this_month: number;
  total_failed_requests_this_month: number;
  last_request_at: string | null;
  today: UsageBillingWindow;
  current_month: UsageBillingWindow;
  last_12_months: UsageBillingWindow;
}

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function mapBucketItem(value: unknown): UsageBillingBucketItem {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    period_start: typeof item.period_start === 'string' ? item.period_start : '',
    total_requests: toNumber(item.total_requests),
    successful_requests: toNumber(item.successful_requests),
    failed_requests: toNumber(item.failed_requests)
  };
}

function mapRiskItem(value: unknown): UsageBillingRiskItem {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    risk_level: typeof item.risk_level === 'string' ? item.risk_level : 'UNKNOWN',
    request_count: toNumber(item.request_count)
  };
}

function mapWindow(value: unknown): UsageBillingWindow {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    total_requests: toNumber(item.total_requests),
    successful_requests: toNumber(item.successful_requests),
    failed_requests: toNumber(item.failed_requests),
    risk_category_distribution: Array.isArray(item.risk_category_distribution) ? item.risk_category_distribution.map(mapRiskItem) : [],
    summary_sentence: typeof item.summary_sentence === 'string' ? item.summary_sentence : '',
    daily_request_counts: Array.isArray(item.daily_request_counts) ? item.daily_request_counts.map(mapBucketItem) : [],
    monthly_request_counts: Array.isArray(item.monthly_request_counts) ? item.monthly_request_counts.map(mapBucketItem) : []
  };
}

function mapUsageBillingSummaryResponse(value: unknown): UsageBillingSummaryResponse {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    request_success_rate_pct: toNumber(item.request_success_rate_pct),
    total_calls_this_month: toNumber(item.total_calls_this_month),
    total_failed_requests_this_month: toNumber(item.total_failed_requests_this_month),
    last_request_at: typeof item.last_request_at === 'string' ? item.last_request_at : null,
    today: mapWindow(item.today),
    current_month: mapWindow(item.current_month),
    last_12_months: mapWindow(item.last_12_months)
  };
}

export async function fetchUsageBillingSummary(): Promise<UsageBillingSummaryResponse> {
  const response = await apiFetch(`${apiBaseUrl}/dashboard/usage/summary`, {
    method: 'GET'
  });

  const data = (await response.json().catch(() => null)) as UsageBillingSummaryResponse | ApiErrorResponse | null;

  console.log('[Usage Billing API]', {
    status: response.status,
    response: data
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Unable to fetch usage summary';
    throw new Error(message);
  }

  return mapUsageBillingSummaryResponse(data);
}
