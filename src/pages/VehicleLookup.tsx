import { useEffect, useMemo, useState } from 'react';
import { useScoreLookup } from '../hooks/useScoreLookup';
import { scoreViolations } from '../utils/dbsScoring';
import { ScoreResult } from '../types/score';
import { scoreColor } from '../utils/scoreColor';

const RECENT_QUERIES_STORAGE_KEY = 'dbs_bajaj_recent_vehicle_queries';
const RECENT_QUERIES_TTL_MS = 24 * 60 * 60 * 1000;

type RecentQuery = {
  regNo: string;
  band: string;
  savedAt: number;
};

function formatBandLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value?: string) {
  return value
    ? new Date(`${value}Z`).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';
}

function formatDate(value?: string) {
  return value
    ? new Date(`${value}Z`).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

export default function VehicleLookup() {
  const [regInput, setRegInput] = useState('');
  const [queryReg, setQueryReg] = useState('');
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);

  const formattedReg = useMemo(() => regInput.toUpperCase().replace(/[^A-Z0-9]/g, ''), [regInput]);
  const result = useScoreLookup(queryReg);
  const selected = result.data as ScoreResult | undefined;

  const bandClass = (label: string) =>
    `recent-band band-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  const onQuery = () => {
    if (!formattedReg) return;
    setQueryReg(formattedReg);
  };

  const onRecentQuery = (reg: string) => {
    setRegInput(reg.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1$2 $3 $4'));
    setQueryReg(reg);
  };

  const displayScore = selected ? Math.round(selected.score) : 0;
  const needleRotation = selected ? (displayScore / 300) * 180 - 90 : -90;
  const arcLength = 267;
  const minimumVisibleScore = selected?.band === 'EXTREME_RISK' ? 18 : 0;
  const visualArcScore = Math.min(Math.max(selected ? Math.max(displayScore, minimumVisibleScore) : 0, 0), 300);
  const arcProgress = visualArcScore / 300;
  const arcOffset = arcLength * (1 - arcProgress);
  const [animatedArcOffset, setAnimatedArcOffset] = useState(arcLength);
  const selectedViolations = selected?.violations ?? [];
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setMonth(windowStart.getMonth() - 12);
  const inWindowViolations = scoreViolations(selectedViolations, 12, now);
  const lastViolation = inWindowViolations[0];
  const monthsAgo = lastViolation
    ? Math.max(0, Math.round((now.getTime() - new Date(lastViolation.date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null;
  const highCount = inWindowViolations.filter((v) => v.thz === 'H').length;
  const medCount = inWindowViolations.filter((v) => v.thz === 'M').length;
  const lowCount = inWindowViolations.filter((v) => v.thz === 'L').length;
  const latestBandLabel = selected ? formatBandLabel(selected.band) : 'Ready';
  const formatWindowMonth = (date: Date) => date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const gaugeColor = selected ? scoreColor(selected.band) : '#16a34a';
  const activeGaugeStroke = selected?.band === 'EXTREME_RISK' ? gaugeColor : 'url(#arcGradActive)';

  const currentVehicleSummary = selected
    ? [
        ['Registration No.', selected.regNo || formattedReg || 'N/A'],
        ['State', selected.stateName || 'Unknown'],
        ['Score', String(displayScore)],
        ['Band', formatBandLabel(selected.band)],
        ['Queried At', formatDateTime(selected.queriedAt)],
        ['Fresh As Of', formatDate(selected.freshAsOf)]
      ]
    : [];

  const exportTableRows = selected
    ? inWindowViolations.map((violation) => [
        new Date(violation.date).toLocaleDateString('en-IN'),
        [violation.challanDetails || violation.type, violation.type].filter(Boolean).join(' - '),
        [violation.categoryName, violation.categoryDescription].filter(Boolean).join(' - ') || violation.code || 'N/A',
        `-${violation.impactPoints} pts`
      ])
    : [];

  const exportCsv = () => {
    if (!selected) return;

      const summaryRows = [
        ['Vehicle Lookup Summary'],
        ['Field', 'Value'],
        ...currentVehicleSummary,
        [],
        ['Violation History'],
        ['Date', 'Violation Details', 'Category', 'Impact'],
        ...exportTableRows
      ];

    const csv = summaryRows
      .map((row) =>
        row
          .map((cell) => {
            const value = cell == null ? '' : String(cell);
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dbs_bajaj_${sanitizeFileName(selected.regNo || formattedReg || 'vehicle')}_lookup.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!selected) return;

    const rowsHtml = exportTableRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row[0])}</td>
            <td>${escapeHtml(row[1])}</td>
            <td>${escapeHtml(row[2])}</td>
            <td>${escapeHtml(row[3])}</td>
          </tr>
        `
      )
      .join('');

    const summaryHtml = currentVehicleSummary
      .map(
        ([label, value]) => `
          <div class="report-chip">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `
      )
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <title>DBS-Bajaj Vehicle Lookup Report</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background: #fff;
            }
            .report {
              padding: 0;
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: flex-start;
              padding-bottom: 18px;
              border-bottom: 2px solid #dbe4f0;
            }
            .report-eyebrow {
              margin: 0 0 8px;
              font-size: 11px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #2563eb;
              font-weight: 700;
            }
            .report-title {
              margin: 0;
              font-size: 24px;
              letter-spacing: -0.03em;
            }
            .report-meta {
              margin-top: 8px;
              color: #475569;
              font-size: 12px;
              line-height: 1.6;
            }
            .report-band {
              padding: 8px 12px;
              border-radius: 999px;
              border: 1px solid #bfdbfe;
              background: #eff6ff;
              color: #1d4ed8;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              white-space: nowrap;
            }
            .report-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 10px;
              margin: 18px 0 22px;
            }
            .report-chip {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 14px;
              background: #f8fafc;
            }
            .report-chip span {
              display: block;
              font-size: 10px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 6px;
            }
            .report-chip strong {
              display: block;
              font-size: 13px;
              line-height: 1.4;
              color: #0f172a;
            }
            .report-section-title {
              margin: 24px 0 10px;
              font-size: 14px;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              color: #334155;
            }
            .summary-strip {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            .summary-strip div {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 10px 12px;
              background: #fff;
            }
            .summary-strip span {
              display: block;
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .summary-strip strong {
              display: block;
              margin-top: 4px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #dbe4f0;
              padding: 9px 10px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f8fafc;
              font-size: 10px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #475569;
            }
            tbody tr:nth-child(even) td {
              background: #fbfdff;
            }
            .muted {
              color: #64748b;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="report-header">
              <div>
                <p class="report-eyebrow">DBS-Bajaj vehicle lookup report</p>
                <h1 class="report-title">${escapeHtml(selected.regNo || formattedReg || 'Vehicle')}</h1>
                <div class="report-meta">
                  Score: <strong>${displayScore}</strong> · Band: <strong>${escapeHtml(formatBandLabel(selected.band))}</strong><br />
                  Queried: ${escapeHtml(formatDateTime(selected.queriedAt))}<br />
                  Fresh as of: ${escapeHtml(formatDate(selected.freshAsOf))}
                </div>
              </div>
              <div class="report-band">${escapeHtml(formatBandLabel(selected.band))}</div>
            </div>

            <div class="report-grid">${summaryHtml}</div>

            <div class="report-section-title">Violation Summary</div>
            <div class="summary-strip">
              <div><span>Violations</span><strong>${inWindowViolations.length}</strong></div>
              <div><span>Last violation</span><strong>${lastViolation ? `${monthsAgo ?? 0} mo` : 'None'}</strong></div>
              <div><span>Window</span><strong>12 months</strong></div>
            </div>

            <div class="report-section-title">Violation History</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Violation Details</th>
                  <th>Category</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="4" class="muted">No violations found in scoring window</td></tr>'}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const reportWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!reportWindow) return;

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    window.setTimeout(() => {
      try {
        reportWindow.focus();
        reportWindow.print();
      } catch {
        // Ignore print failures if the browser blocks the call.
      }
    }, 250);
  };

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(RECENT_QUERIES_STORAGE_KEY) ??
        localStorage.getItem('dbs_recent_vehicle_queries');
      if (!raw) return;

      const parsed = JSON.parse(raw) as RecentQuery[];
      const nowTs = Date.now();
      const valid = parsed.filter(
        (item) =>
          item &&
          typeof item.regNo === 'string' &&
          typeof item.band === 'string' &&
          typeof item.savedAt === 'number' &&
          nowTs - item.savedAt < RECENT_QUERIES_TTL_MS
      );

      setRecentQueries(valid);
      if (valid.length !== parsed.length) {
        localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(valid));
      } else if (!localStorage.getItem(RECENT_QUERIES_STORAGE_KEY)) {
        localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(valid));
      }
    } catch {
      localStorage.removeItem(RECENT_QUERIES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setAnimatedArcOffset(arcLength);
      return;
    }

    setAnimatedArcOffset(arcLength);
    const frame = window.requestAnimationFrame(() => {
      setAnimatedArcOffset(arcOffset);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [arcLength, arcOffset, selected?.regNo]);

  useEffect(() => {
    if (!selected) return;

    setRecentQueries((prev) => {
      const next = [
        {
          regNo: selected.regNo,
          band: selected.band.replace(/_/g, ' '),
          savedAt: Date.now()
        },
        ...prev.filter((item) => item.regNo !== selected.regNo)
      ].slice(0, 10);

      localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [selected]);

  return (
    <div className="lookup-page">
      {/* <section className="lookup-hero card">
        <div className="lookup-hero-copy">
          <p className="lookup-eyebrow">Underwriting lookup</p>
          <h1>Vehicle score and violation history in one view</h1>
          <p>Search a registration number to review the current score, risk band, and recent violations without clutter.</p>
        </div>
        <div className="lookup-hero-metrics">
          <div className="lookup-metric">
            <span>Scoring window</span>
            <strong>12 months</strong>
          </div>
          <div className="lookup-metric">
            <span>Saved lookups</span>
            <strong>{recentQueries.length}</strong>
          </div>
          <div className="lookup-metric">
            <span>Latest band</span>
            <strong>{latestBandLabel}</strong>
          </div>
        </div>
      </section> */}

      <div className="lookup-layout">
        <aside className="lookup-sidebar-panel">
          <div className="card lookup-sidebar-card lookup-search-card">
            <div className="card-title">Vehicle Registration Lookup</div>
            <p className="lookup-search-copy">Enter a registration number and run the score against the live underwriting feed.</p>

            <form
              className="lookup-input-group"
              onSubmit={(e) => {
                e.preventDefault();
                onQuery();
              }}
            >
              <div>
                <div className="field-label">Registration Number</div>
                <input
                  className="reg-input"
                  value={regInput}
                  placeholder="e.g. UP32 AB 1234"
                  onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                />
              </div>
              <button type="submit" className="lookup-btn">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Run lookup
              </button>
            </form>

            <div className="recent-queries">
              <div className="card-title" style={{ marginBottom: 10 }}>
                Recent Queries
              </div>
              <div className="recent-queries-scroll">
                {recentQueries.length ? (
                  recentQueries.map((item) => (
                    <div key={item.regNo} className="recent-item" onClick={() => onRecentQuery(item.regNo)}>
                      <span className="recent-reg">{item.regNo.replace(/(\w{2})(\d{2})(\w{2})(\d+)/, '$1 $2 $3 $4')}</span>
                      <span className={bandClass(item.band)}>{item.band}</span>
                    </div>
                  ))
                ) : (
                  <div className="api-key-empty" style={{ marginTop: 0 }}>
                    No recent queries yet. Use the input above to look up a vehicle.
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="lookup-results-stack">
          {!queryReg && (
            <div className="lookup-empty-card card">
              <div className="lookup-empty-icon">01</div>
              <div className="lookup-empty-copy">
                <h2>Search to load a score</h2>
                <p>Once you run a lookup, we’ll show the gauge, current band, and the last 12 months of violations here.</p>
              </div>
              <div className="lookup-empty-steps">
                <div>
                  <strong>1.</strong>
                  <span>Enter a registration number</span>
                </div>
                <div>
                  <strong>2.</strong>
                  <span>Review the score and band</span>
                </div>
                <div>
                  <strong>3.</strong>
                  <span>Scan the violation history</span>
                </div>
              </div>
            </div>
          )}

          {queryReg && result.isLoading && (
            <div className="lookup-empty-card card">
              <div className="lookup-empty-icon">⌛</div>
              <div className="lookup-empty-copy">
                <h2>Loading vehicle score</h2>
                <p>Fetching the latest lookup and violation history now.</p>
              </div>
            </div>
          )}

          {queryReg && result.isError && !result.isLoading && (
            <div className="lookup-empty-card card">
              <div className="lookup-empty-icon">!</div>
              <div className="lookup-empty-copy">
                <h2>Lookup failed</h2>
                <p style={{ color: '#dc2626' }}>{result.error?.message || 'Vehicle not found or lookup failed'}</p>
              </div>
            </div>
          )}

          {selected && !result.isLoading && (
            <section className="lookup-score-card">
              <div className="lookup-score-head">
                <div>
                  <div className="lookup-reg">{selected.regNo || formattedReg || 'UP32 AB 1234'}</div>
                  <div className="lookup-sub">
                    Queried: {formatDateTime(selected.queriedAt)} · Fresh as of {formatDate(selected.freshAsOf)}
                  </div>
                </div>
                <div className="lookup-band-pill">{formatBandLabel(selected.band)}</div>
              </div>

              <div className="lookup-score-body">
                <div className="gauge-container">
                  <svg viewBox="0 0 200 110">
                    <defs>
                      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.35" />
                        <stop offset="20%" stopColor="#991b1b" stopOpacity="0.35" />
                        <stop offset="30%" stopColor="#b91c1c" stopOpacity="0.35" />
                        <stop offset="40%" stopColor="#dc2626" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.35" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.35" />
                        <stop offset="80%" stopColor="#22c55e" stopOpacity="0.35" />
                        <stop offset="90%" stopColor="#16a34a" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.35" />
                      </linearGradient>
                      <linearGradient id="arcGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.9" />
                        <stop offset="20%" stopColor="#991b1b" stopOpacity="0.9" />
                        <stop offset="30%" stopColor="#b91c1c" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#dc2626" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.9" />
                        <stop offset="80%" stopColor="#22c55e" stopOpacity="0.9" />
                        <stop offset="90%" stopColor="#16a34a" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 15 100 A 85 85 0 0 1 185 100"
                      fill="none"
                      stroke="url(#arcGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      id="gauge-arc"
                      d="M 15 100 A 85 85 0 0 1 185 100"
                      fill="none"
                      stroke={activeGaugeStroke}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={arcLength}
                      strokeDashoffset={animatedArcOffset}
                      style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                    <g id="needle-group" transform={`rotate(${needleRotation} 100 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill="white" />
                      <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                    </g>
                  </svg>
                  <div className="gauge-score-label">
                    <span className="gauge-number" style={{ color: gaugeColor }}>
                      {displayScore}
                    </span>
                    <span className="gauge-band" style={{ color: gaugeColor }}>
                      {selected.band.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="lookup-score-highlights">
                  <div className="lookup-highlight">
                    <span className="lookup-highlight-label">Score</span>
                    <strong>{displayScore}</strong>
                    <small>out of 300</small>
                  </div>
                  <div className="lookup-highlight">
                    <span className="lookup-highlight-label">Violations</span>
                    <strong>{inWindowViolations.length}</strong>
                    <small>12 month window</small>
                  </div>
                  <div className="lookup-highlight">
                    <span className="lookup-highlight-label">Last violation</span>
                    <strong>{lastViolation ? `${monthsAgo ?? 0} mo` : 'None'}</strong>
                    <small>{lastViolation ? formatDate(lastViolation.date) : 'Clean in window'}</small>
                  </div>
                </div>
              </div>
            </section>
          )}

          {selected && !result.isLoading && (
            <section className="violations-card lookup-history-card">
              <div className="violations-header lookup-history-header">
                <div>
                  <div className="title">Violation History</div>
                  <div className="subtitle">{inWindowViolations.length} violations in the scoring window</div>
                </div>
                <div className="lookup-history-actions">
                  <div className="window-badge">
                    12-month window - {formatWindowMonth(windowStart)} to {formatWindowMonth(now)}
                  </div>
                  <button type="button" className="lookup-export-btn ghost" onClick={exportPdf}>
                    Export PDF
                  </button>
                  <button type="button" className="lookup-export-btn" onClick={exportCsv}>
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="lookup-table-wrap">
                <table className="lookup-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Violation</th>
                      <th>Category</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inWindowViolations.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '18px 20px' }}>
                          No violations found in scoring window
                        </td>
                      </tr>
                    )}
                    {inWindowViolations.map((violation, idx) => {
                      const categoryLabel = [violation.categoryName, violation.categoryDescription].filter(Boolean).join(' - ');
                      const impactClass =
                        violation.thz === 'H' ? 'lookup-history-impact high' : violation.thz === 'M' ? 'lookup-history-impact medium' : 'lookup-history-impact low';

                      return (
                        <tr key={`${violation.type}-${violation.date}-${idx}`}>
                          <td className="lookup-history-date">{new Date(violation.date).toLocaleDateString('en-IN')}</td>
                          <td>
                            <div className="lookup-violation-main">{violation.challanDetails || violation.type}</div>
                            <div className="lookup-violation-sub">{violation.type}</div>
                          </td>
                          <td className="lookup-history-category">{categoryLabel || violation.code}</td>
                          <td className={impactClass}>-{violation.impactPoints} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
