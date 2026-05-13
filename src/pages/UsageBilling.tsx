import { useState } from 'react';

type TabKey = 'today' | 'month' | 'history';
type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

type BandRow = {
  label: string;
  pct: number;
  count: number;
  color: string;
};

type DayRow = {
  date: string;
  total: number;
  successful: number;
  failed: number;
  failRate: number;
};

type MonthRow = {
  month: string;
  total: number;
  successful: number;
  failed: number;
  status: 'Stable' | 'Monitoring' | 'Attention' | 'Review';
};

type MetricCard = {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
};

const lastRefreshed = new Date('2026-05-09T14:32:00+05:30');

const bandRows: BandRow[] = [
  { label: 'SEVERE', pct: 8, count: 272, color: '#E24B4A' },
  { label: 'HIGH', pct: 14, count: 476, color: '#BA7517' },
  { label: 'MODERATE', pct: 27, count: 921, color: '#888780' },
  { label: 'LOW', pct: 33, count: 1_126, color: '#1D9E75' },
  { label: 'EXCELLENT', pct: 12, count: 410, color: '#0F6E56' },
  { label: 'EXEMPLARY', pct: 6, count: 204, color: '#064E3B' }
];  

const monthDays: DayRow[] = [
  { date: '01 May', total: 3_812, successful: 3_779, failed: 33, failRate: 0.9 },
  { date: '02 May', total: 3_926, successful: 3_888, failed: 38, failRate: 1.0 },
  { date: '03 May', total: 4_014, successful: 3_977, failed: 37, failRate: 0.9 },
  { date: '04 May', total: 3_744, successful: 3_716, failed: 28, failRate: 0.7 },
  { date: '05 May', total: 4_121, successful: 4_080, failed: 41, failRate: 1.0 },
  { date: '06 May', total: 4_238, successful: 4_193, failed: 45, failRate: 1.1 },
  { date: '07 May', total: 4_116, successful: 4_079, failed: 37, failRate: 0.9 },
  { date: '08 May', total: 4_307, successful: 4_275, failed: 32, failRate: 0.7 },
  { date: '09 May', total: 3_612, successful: 3_589, failed: 23, failRate: 0.6 }
];

const monthlyRows: MonthRow[] = [
  { month: 'May 2025', total: 35_420, successful: 35_126, failed: 294, status: 'Stable' },
  { month: 'Jun 2025', total: 34_880, successful: 34_602, failed: 278, status: 'Stable' },
  { month: 'Jul 2025', total: 36_110, successful: 35_742, failed: 368, status: 'Stable' },
  { month: 'Aug 2025', total: 37_530, successful: 37_146, failed: 384, status: 'Stable' },
  { month: 'Sep 2025', total: 38_240, successful: 37_902, failed: 338, status: 'Stable' },
  { month: 'Oct 2025', total: 39_105, successful: 38_752, failed: 353, status: 'Stable' },
  { month: 'Nov 2025', total: 39_870, successful: 39_520, failed: 350, status: 'Stable' },
  { month: 'Dec 2025', total: 40_440, successful: 40_059, failed: 381, status: 'Stable' },
  { month: 'Jan 2026', total: 41_040, successful: 40_662, failed: 378, status: 'Monitoring' },
  { month: 'Feb 2026', total: 41_820, successful: 41_441, failed: 379, status: 'Monitoring' },
  { month: 'Mar 2026', total: 42_410, successful: 42_016, failed: 394, status: 'Attention' },
  { month: 'Apr 2026', total: 41_960, successful: 41_612, failed: 348, status: 'Review' }
];

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

function statusClass(status: MonthRow['status']) {
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

function metricCardsForTab(tab: TabKey): MetricCard[] {
  if (tab === 'today') {
    return [
      { label: 'Total calls', value: '3,412', tone: 'accent' },
      { label: 'Successful', value: '3,389', sub: '99.3% success rate', tone: 'success' },
      { label: 'Failed', value: '23', sub: 'Upstream service error', tone: 'danger' }
    ];
  }

  if (tab === 'month') {
    return [
      { label: 'Total calls this month', value: '41,880', tone: 'accent' },
      { label: 'Successful', value: '41,504', sub: '99.1% success rate', tone: 'success' },
      { label: 'Failed', value: '376', sub: '0.9% failure rate', tone: 'danger' }
    ];
  }

  return [
    { label: 'Total calls in 12 months', value: '428,340', tone: 'accent' },
    { label: 'Successful', value: '424,710', sub: '99.2% success rate', tone: 'success' },
    { label: 'Failed', value: '3,630', sub: 'Across 12 months', tone: 'danger' }
  ];
}

export default function UsageBilling() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  const renderBandRows = (total: number) =>
    bandRows.map((band) => (
      <div className="usage-billing-band-row" key={band.label}>
        <span className="usage-billing-band-label">{band.label}</span>
        <div className="usage-billing-band-track">
          <div className="usage-billing-band-fill" style={{ width: `${band.pct}%`, background: band.color }} />
        </div>
        <span className="usage-billing-band-meta">{formatCount(Math.round((total * band.pct) / 100))}</span>
      </div>
    ));

  const metricCards = metricCardsForTab(activeTab);
  const renderRiskMixPanel = (title: string, subtitle: string, total: number, badge: string) => (
    <div className="card usage-billing-panel usage-billing-panel--accent">
      <div className="usage-billing-panel-header">
        <div>
          <div className="card-title">{title}</div>
          <div className="usage-billing-panel-subtitle">{subtitle}</div>
        </div>
        <span className="usage-billing-mini-badge">{badge}</span>
      </div>
      <div className="usage-billing-band-list">{renderBandRows(total)}</div>
      {activeTab === 'today' ? (
        <div className="usage-billing-callout">
          Clean and low-risk vehicles make up the largest share of today's activity, with the strongest concentration
          in the low-risk band.
        </div>
      ) : null}
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
          {/* <div className="usage-billing-chip-row">
            <span className="usage-billing-chip">Bajaj Allianz General Insurance</span>
            <span className="usage-billing-chip">DBS Score API</span>
            <span className="usage-billing-chip">OD underwriting</span>
          </div> */}
        </div>

        <div className="usage-billing-hero-panel">
          <div className="usage-billing-hero-panel-top">
            <span className="usage-billing-hero-status">Live</span>
              <span className="usage-billing-hero-refresh">
                Last refreshed {lastRefreshed.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="usage-billing-hero-number">99.1%</div>
          <div className="usage-billing-hero-caption">Current API success rate across this month so far</div>
          <div className="usage-billing-hero-mini">
            <span>
              <strong>41,880</strong>
              <small>Calls this month</small>
            </span>
            <span>
              <strong>376</strong>
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

      <div className="usage-billing-metrics">
        {metricCards.map((metric) => (
          <div key={metric.label} className={`usage-billing-metric-card ${toneClass(metric.tone)}`}>
            <div className="usage-billing-metric-label">{metric.label}</div>
            <div className="usage-billing-metric-value">{metric.value}</div>
            {metric.sub ? <div className="usage-billing-metric-sub">{metric.sub}</div> : null}
          </div>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">
            {renderRiskMixPanel("Risk mix", "Today's vehicle mix, weighted by score band", 3_201, 'Primary focus')}
          </div>

          <aside className="usage-billing-side-col">
            <div className="card usage-billing-panel usage-billing-panel--tall">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">Service health</div>
                  <div className="usage-billing-panel-subtitle">Service quality and reliability signals</div>
                </div>
              </div>
              <div className="usage-billing-status-list">
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot success" />
                  <div className="usage-billing-status-copy">
                    <strong>3,389 successful calls</strong>
                    <span>99.3% success rate</span>
                  </div>
                </div>
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot warning" />
                  <div className="usage-billing-status-copy">
                    <strong>23 failed calls</strong>
                    <span>Transient upstream service errors</span>
                  </div>
                </div>
              </div>

              <div className="usage-billing-divider" />

              <div className="usage-billing-legend">
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#005dac' }} />
                  <span>Peak load</span>
                </div>
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#0b8666' }} />
                  <span>Healthy output</span>
                </div>
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#d29b00' }} />
                  <span>Review queue</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      {activeTab === 'month' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">
            {renderRiskMixPanel('Risk mix', 'This month so far, weighted by score band', 38_712, 'Pinned here')}
            <div className="card usage-billing-panel">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">Day-wise breakdown</div>
                  <div className="usage-billing-panel-subtitle">May 2026 traffic so far and failure profile</div>
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
                  {monthDays.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.total)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.successful)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.failed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="usage-billing-side-col">
            <div className="card usage-billing-panel usage-billing-panel--tall">
              <div className="usage-billing-panel-header">
                <div>
                  <div className="card-title">Service health</div>
                  <div className="usage-billing-panel-subtitle">Service quality and reliability signals</div>
                </div>
              </div>
              <div className="usage-billing-status-list">
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot success" />
                  <div className="usage-billing-status-copy">
                    <strong>3,389 successful calls</strong>
                    <span>99.3% success rate</span>
                  </div>
                </div>
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot warning" />
                  <div className="usage-billing-status-copy">
                    <strong>23 failed calls</strong>
                    <span>Transient upstream service errors</span>
                  </div>
                </div>
              </div>

              <div className="usage-billing-divider" />

              <div className="usage-billing-legend">
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#005dac' }} />
                  <span>Peak load</span>
                </div>
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#0b8666' }} />
                  <span>Healthy output</span>
                </div>
                <div className="usage-billing-legend-item">
                  <span className="usage-billing-legend-swatch" style={{ background: '#d29b00' }} />
                  <span>Review queue</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="usage-billing-layout">
          <div className="usage-billing-main-col">
            {renderRiskMixPanel('Risk mix', '12-month score distribution from the full yearly sample', 391_200, 'Pinned here')}
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
                  {monthlyRows.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.total)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.successful)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCount(row.failed)}</td>
                      <td>
                        <span className={`usage-billing-pill ${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="usage-billing-note">Consumption is manually reviewed. Window status is updated by SIIPL admin.</div>
            </div>

            <div className="usage-billing-card-grid">
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
                    <strong>428,340</strong>
                  </div>
                  <div className="usage-billing-stat-row">
                    <span>Stable windows</span>
                    <strong>8 of 12</strong>
                  </div>
                  <div className="usage-billing-stat-row">
                    <span>Active windows</span>
                    <strong>4 windows</strong>
                  </div>
                  <div className="usage-billing-stat-row">
                    <span>Control state</span>
                    <strong>
                      <span className="usage-billing-pill neutral">Operations reconciliation</span>
                    </strong>
                  </div>
                </div>
                <div className="usage-billing-callout">
                  The year-over-year pattern stays stable with low failure rates and a narrow consumption variance band.
                </div>
              </div>
            </div>
          </div>

          <aside className="usage-billing-side-col">
            <div className="card usage-billing-panel usage-billing-panel--tall">
                <div className="usage-billing-panel-header">
                  <div>
                    <div className="card-title">Consumption flow</div>
                  <div className="usage-billing-panel-subtitle">A quick view of month states across the year</div>
                </div>
              </div>
              <div className="usage-billing-status-list">
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot success" />
                  <div className="usage-billing-status-copy">
                    <strong>8 stable months</strong>
                    <span>Stable close-out cadence</span>
                  </div>
                </div>
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot warning" />
                  <div className="usage-billing-status-copy">
                    <strong>2 months monitoring</strong>
                    <span>Awaiting review steps</span>
                  </div>
                </div>
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot danger" />
                  <div className="usage-billing-status-copy">
                    <strong>1 month attention</strong>
                    <span>Needs attention and dispatch</span>
                  </div>
                </div>
                <div className="usage-billing-status-item">
                  <span className="usage-billing-status-dot neutral" />
                  <div className="usage-billing-status-copy">
                    <strong>1 month under review</strong>
                    <span>Waiting final confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

