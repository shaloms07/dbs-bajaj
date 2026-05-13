import { useState } from 'react';
import { useUsageBillingSummary } from '../hooks/useUsageBillingSummary';
import { UsageBillingBucketItem, UsageBillingRiskItem, UsageBillingWindow } from '../services/usageBillingService';

type TabKey = 'today' | 'month' | 'history';
type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

type MonthStatus = 'Stable' | 'Monitoring' | 'Attention' | 'Review';

type MetricCard = {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
};

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

function normalizePercent(value: number) {
  if (value > 0 && value <= 1) return value * 100;
  return value;
}

function formatPercent(value: number, digits = 1) {
  return `${normalizePercent(value).toFixed(digits)}%`;
}

function formatDateTime(value?: string | null) {
  return value
    ? new Date(value).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';
}

function formatDayLabel(value: string) {
  if (!value) return 'N/A';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short'
  });
}

function formatMonthLabel(value: string) {
  if (!value) return 'N/A';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    year: 'numeric'
  });
}

function formatRiskLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function riskColor(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, ' ');

  if (normalized.includes('severe') || normalized.includes('extreme')) return '#E24B4A';
  if (normalized.includes('high')) return '#BA7517';
  if (normalized.includes('moderate') || normalized.includes('medium')) return '#888780';
  if (normalized.includes('low')) return '#1D9E75';
  if (normalized.includes('excellent')) return '#0F6E56';
  if (normalized.includes('exemplary')) return '#064E3B';
  return '#005dac';
}

function statusClass(status: MonthStatus) {
  switch (status) {
    case 'Stable':
      return 'success';
    case 'Monitoring':
      return 'warning';
    case 'Attention':
      return 'danger';
    case 'Review':
      return 'neutral';
  }
}

function toneClass(tone?: Tone) {
  if (!tone) return '';
  return `tone-${tone}`;
}

function getSuccessRate(total: number, successful: number) {
  if (!total) return 0;
  return (successful / total) * 100;
}

function getFailureRate(total: number, failed: number) {
  if (!total) return 0;
  return (failed / total) * 100;
}

function getWindowStatus(total: number, failed: number): MonthStatus {
  if (!total) return 'Review';
  const failRate = getFailureRate(total, failed);
  if (failRate < 1) return 'Stable';
  if (failRate < 2) return 'Monitoring';
  if (failRate < 3) return 'Attention';
  return 'Review';
}

function buildMetricCards(tab: TabKey, data: UsageBillingWindow): MetricCard[] {
  const successRate = getSuccessRate(data.total_requests, data.successful_requests);
  const failureRate = getFailureRate(data.total_requests, data.failed_requests);
  const totalLabel =
    tab === 'today' ? 'Total calls' : tab === 'month' ? 'Total calls this month' : 'Total calls in 12 months';

  return [
    { label: totalLabel, value: formatCount(data.total_requests), tone: 'accent' },
    { label: 'Successful', value: formatCount(data.successful_requests), sub: `${formatPercent(successRate)} success rate`, tone: 'success' },
    { label: 'Failed', value: formatCount(data.failed_requests), sub: `${formatPercent(failureRate)} failure rate`, tone: 'danger' }
  ];
}

function buildBandRows(items: UsageBillingRiskItem[]) {
  const total = items.reduce((sum, item) => sum + item.request_count, 0);

  return items.map((item) => ({
    label: formatRiskLabel(item.risk_level),
    count: item.request_count,
    pct: total ? (item.request_count / total) * 100 : 0,
    color: riskColor(item.risk_level)
  }));
}

function buildHistoryRows(items: UsageBillingBucketItem[]) {
  return items.map((item) => ({
    month: formatMonthLabel(item.period_start),
    total: item.total_requests,
    successful: item.successful_requests,
    failed: item.failed_requests,
    status: getWindowStatus(item.total_requests, item.failed_requests)
  }));
}

function buildSummaryStats(historyRows: ReturnType<typeof buildHistoryRows>) {
  const stableWindows = historyRows.filter((row) => row.status === 'Stable').length;
  const activeWindows = historyRows.filter((row) => row.total > 0).length;
  const latestStatus = historyRows[historyRows.length - 1]?.status ?? 'Review';

  return {
    stableWindows,
    activeWindows,
    latestStatus
  };
}

export default function UsageBilling() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const { data, isLoading, error } = useUsageBillingSummary();

  const tabData =
    activeTab === 'today' ? data?.today : activeTab === 'month' ? data?.current_month : data?.last_12_months;
  const metricCards = tabData ? buildMetricCards(activeTab, tabData) : [];
  const bandRows = tabData ? buildBandRows(tabData.risk_category_distribution) : [];
  const historyRows = data ? buildHistoryRows(data.last_12_months.monthly_request_counts) : [];
  const historyStats = buildSummaryStats(historyRows);
  const currentMonthSuccessRate = data ? getSuccessRate(data.total_calls_this_month, data.total_calls_this_month - data.total_failed_requests_this_month) : 0;
  const activeTabSuccessRate = tabData ? getSuccessRate(tabData.total_requests, tabData.successful_requests) : 0;
  const activeTabFailureRate = tabData ? getFailureRate(tabData.total_requests, tabData.failed_requests) : 0;

  const renderBandRows = () =>
    bandRows.length ? (
      bandRows.map((band) => (
        <div className="usage-billing-band-row" key={band.label}>
          <span className="usage-billing-band-label">{band.label}</span>
          <div className="usage-billing-band-track">
            <div className="usage-billing-band-fill" style={{ width: `${band.pct}%`, background: band.color }} />
          </div>
          <span className="usage-billing-band-meta">{formatCount(band.count)}</span>
        </div>
      ))
    ) : (
      <div className="usage-billing-note">No risk distribution data available for this window.</div>
    );

  const renderRiskMixPanel = (title: string, subtitle: string, badge: string) => (
    <div className="card usage-billing-panel usage-billing-panel--accent">
      <div className="usage-billing-panel-header">
        <div>
          <div className="card-title">{title}</div>
          <div className="usage-billing-panel-subtitle">{subtitle}</div>
        </div>
        <span className="usage-billing-mini-badge">{badge}</span>
      </div>
      <div className="usage-billing-band-list">{renderBandRows()}</div>
      {tabData?.summary_sentence ? <div className="usage-billing-callout">{tabData.summary_sentence}</div> : null}
    </div>
  );

  const renderServiceHealthPanel = () => (
    <div className="card usage-billing-panel usage-billing-panel--tall">
      <div className="usage-billing-panel-header">
        <div>
          <div className="card-title">Service health</div>
          <div className="usage-billing-panel-subtitle">Live delivery quality for the selected window</div>
        </div>
      </div>
      <div className="usage-billing-status-list">
        <div className="usage-billing-status-item">
          <span className="usage-billing-status-dot success" />
          <div className="usage-billing-status-copy">
            <strong>{formatCount(tabData?.successful_requests ?? 0)} successful calls</strong>
            <span>{formatPercent(activeTabSuccessRate)} success rate</span>
          </div>
        </div>
        <div className="usage-billing-status-item">
          <span className="usage-billing-status-dot warning" />
          <div className="usage-billing-status-copy">
            <strong>{formatCount(tabData?.failed_requests ?? 0)} failed calls</strong>
            <span>{formatPercent(activeTabFailureRate)} failure rate</span>
          </div>
        </div>
      </div>

      <div className="usage-billing-divider" />

      <div className="usage-billing-stat-stack">
        <div className="usage-billing-stat-row">
          <span>Total requests</span>
          <strong>{formatCount(tabData?.total_requests ?? 0)}</strong>
        </div>
        <div className="usage-billing-stat-row">
          <span>Last request</span>
          <strong>{formatDateTime(data?.last_request_at)}</strong>
        </div>
        <div className="usage-billing-stat-row">
          <span>Window summary</span>
          <strong>{tabData?.summary_sentence || 'Awaiting usage summary from backend.'}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="usage-billing-shell">
      <div className="usage-billing-hero">
        <div className="usage-billing-hero-copy">
          <div className="usage-billing-eyebrow">Operations dashboard</div>
          <h2 className="usage-billing-title">Usage & Consumption</h2>
          <p className="usage-billing-intro">
            A compact command view for DBS Score usage, service health, and monthly consumption tracking.
          </p>
        </div>

        <div className="usage-billing-hero-panel">
          <div className="usage-billing-hero-panel-top">
            <span className="usage-billing-hero-status">{error ? 'Issue' : 'Live'}</span>
            <span className="usage-billing-hero-refresh">Last refreshed {formatDateTime(data?.last_request_at)}</span>
          </div>
          <div className="usage-billing-hero-number">
            {isLoading ? '...' : formatPercent(currentMonthSuccessRate)}
          </div>
          <div className="usage-billing-hero-caption">Current API success rate across this month so far</div>
          <div className="usage-billing-hero-mini">
            <span>
              <strong>{formatCount(data?.total_calls_this_month ?? 0)}</strong>
              <small>Calls this month</small>
            </span>
            <span>
              <strong>{formatCount(data?.total_failed_requests_this_month ?? 0)}</strong>
              <small>Failed</small>
            </span>
          </div>
        </div>
      </div>

      <div className="tabs usage-billing-tabs">
        <button type="button" className={`tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
          Today
        </button>
        <button type="button" className={`tab ${activeTab === 'month' ? 'active' : ''}`} onClick={() => setActiveTab('month')}>
          This month
        </button>
        <button type="button" className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          Past 12 months
        </button>
      </div>

      {error ? (
        <div className="card usage-billing-panel">
          <div className="card-title">Usage summary unavailable</div>
          <div className="usage-billing-note">{error.message}</div>
        </div>
      ) : null}

      <div className="usage-billing-metrics">
        {(isLoading ? [] : metricCards).map((metric) => (
          <div key={metric.label} className={`usage-billing-metric-card ${toneClass(metric.tone)}`}>
            <div className="usage-billing-metric-label">{metric.label}</div>
            <div className="usage-billing-metric-value">{metric.value}</div>
            {metric.sub ? <div className="usage-billing-metric-sub">{metric.sub}</div> : null}
          </div>
        ))}
        {isLoading &&
          ['Total', 'Successful', 'Failed'].map((label) => (
            <div key={label} className="usage-billing-metric-card">
              <div className="usage-billing-metric-label">{label}</div>
              <div className="usage-billing-metric-value">...</div>
              <div className="usage-billing-metric-sub">Loading live usage data</div>
            </div>
          ))}
      </div>

      {activeTab === 'today' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">{renderRiskMixPanel('Risk mix', "Today's vehicle mix, weighted by score band", 'Primary focus')}</div>

          <aside className="usage-billing-side-col">{renderServiceHealthPanel()}</aside>
        </div>
      )}

      {activeTab === 'month' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">
            {renderRiskMixPanel('Risk mix', 'This month so far, weighted by score band', 'Pinned here')}
            <div className="card usage-billing-panel">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">Day-wise breakdown</div>
                  <div className="usage-billing-panel-subtitle">Current month traffic so far and failure profile</div>
                </div>
                <span className="usage-billing-mini-badge">This month so far</span>
              </div>
              <table className="usage-billing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Successful</th>
                    <th style={{ textAlign: 'right' }}>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.current_month.daily_request_counts.length ? (
                    data.current_month.daily_request_counts.map((row) => (
                      <tr key={row.period_start}>
                        <td>{formatDayLabel(row.period_start)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.total_requests)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.successful_requests)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.failed_requests)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="usage-billing-note">
                        No daily usage rows returned for the current month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="usage-billing-side-col">{renderServiceHealthPanel()}</aside>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">
            {renderRiskMixPanel('Risk mix', '12-month score distribution from the full yearly sample', 'Pinned here')}
            <div className="card usage-billing-panel">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">Month-wise summary</div>
                  <div className="usage-billing-panel-subtitle">Rolling 12-month view for usage and failure rate trends</div>
                </div>
                <span className="usage-billing-mini-badge">12M history</span>
              </div>
              <table className="usage-billing-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'right' }}>Total calls</th>
                    <th style={{ textAlign: 'right' }}>Successful</th>
                    <th style={{ textAlign: 'right' }}>Failed</th>
                    <th>Review state</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.length ? (
                    historyRows.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.total)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.successful)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.failed)}</td>
                        <td>
                          <span className={`usage-billing-pill ${statusClass(row.status)}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="usage-billing-note">
                        No monthly history rows returned by the backend.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="usage-billing-note">Consumption summary is now sourced from the backend usage endpoint.</div>
            </div>
          </div>

          <aside className="usage-billing-side-col">
            <div className="card usage-billing-panel">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">12 month consumption summary</div>
                  <div className="usage-billing-panel-subtitle">Year-level control and usage rollover</div>
                </div>
              </div>
              <div className="usage-billing-stat-stack">
                <div className="usage-billing-stat-row">
                  <span>Total calls</span>
                  <strong>{formatCount(data?.last_12_months.total_requests ?? 0)}</strong>
                </div>
                <div className="usage-billing-stat-row">
                  <span>Stable windows</span>
                  <strong>{historyStats.stableWindows} of {historyRows.length}</strong>
                </div>
                <div className="usage-billing-stat-row">
                  <span>Active windows</span>
                  <strong>{historyStats.activeWindows} windows</strong>
                </div>
                <div className="usage-billing-stat-row">
                  <span>Control state</span>
                  <strong>
                    <span className={`usage-billing-pill ${statusClass(historyStats.latestStatus)}`}>{historyStats.latestStatus}</span>
                  </strong>
                </div>
              </div>
              <div className="usage-billing-callout">
                {data?.last_12_months.summary_sentence || 'The last 12 months summary will appear here once usage data is available.'}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
