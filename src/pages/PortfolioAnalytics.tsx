export default function PortfolioAnalytics() {
  return (
    <div className="portfolio-grid">
      <div className="stat-card"><div className="stat-label">Total Queries (Month)</div><div className="stat-value">24,891</div><div className="stat-change up">? 12% vs last month</div></div>
      <div className="stat-card"><div className="stat-label">Portfolio Avg Score</div><div className="stat-value" style={{ color: 'var(--accent2)' }}>631</div><div className="stat-change up">? 18 pts vs 6mo ago</div></div>
      <div className="stat-card"><div className="stat-label">High Risk Vehicles</div><div className="stat-value" style={{ color: 'var(--red)' }}>8.3%</div><div className="stat-change down">? 1.2% improvement</div></div>
      <div className="stat-card"><div className="stat-label">Clean Record (Exemplary)</div><div className="stat-value" style={{ color: 'var(--green)' }}>41.2%</div><div className="stat-change up">? 3.4% this quarter</div></div>

      <div className="portfolio-lower">
        <div className="band-distribution">
          <div className="card-title">Portfolio Score Band Distribution</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>24,891 vehicles queried this month</div>
          <div className="band-bars">
            <div className="band-row"><div className="band-name">Exemplary (285–300)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '18%', background: '#059669' }}></div></div><div className="band-pct">18.2%</div></div>
            <div className="band-row"><div className="band-name">Responsible (270–284)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '12%', background: '#16a34a' }}></div></div><div className="band-pct">12.4%</div></div>
            <div className="band-row"><div className="band-name">Average (240–269)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '20%', background: '#22c55e' }}></div></div><div className="band-pct">20.1%</div></div>
            <div className="band-row"><div className="band-name">Marginal (210–239)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '11%', background: '#eab308' }}></div></div><div className="band-pct">11.0%</div></div>
            <div className="band-row"><div className="band-name">At Risk (180–209)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '9%', background: '#f97316' }}></div></div><div className="band-pct">9.2%</div></div>
            <div className="band-row"><div className="band-name">High Risk (150–179)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '8%', background: '#ef4444' }}></div></div><div className="band-pct">8.4%</div></div>
            <div className="band-row"><div className="band-name">Serious Risk (120–149)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '7%', background: '#dc2626' }}></div></div><div className="band-pct">7.1%</div></div>
            <div className="band-row"><div className="band-name">Chronic Violator (90–119)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '6%', background: '#b91c1c' }}></div></div><div className="band-pct">6.0%</div></div>
            <div className="band-row"><div className="band-name">Habitual Offender (60–89)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '5%', background: '#991b1b' }}></div></div><div className="band-pct">4.9%</div></div>
            <div className="band-row"><div className="band-name">Extreme Risk (&lt;60)</div><div className="band-bar-track"><div className="band-bar-fill" style={{ width: '4%', background: '#7f1d1d' }}></div></div><div className="band-pct">3.7%</div></div>
          </div>
        </div>
        <div className="loss-ratio-card">
          <div className="card-title">Loss Ratio Correlation by DBS-Bajaj Band</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Actuarial validation · FY 2025-26 cohort</div>
          <div className="lr-chart">
            <div className="lr-row"><div className="lr-band" style={{ color: '#059669' }}>Exemplary</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '34%', background: '#059669' }}></div></div><div className="lr-pct" style={{ color: '#059669' }}>34%</div><div className="lr-count">7,942 veh</div></div>
            <div className="lr-row"><div className="lr-band" style={{ color: '#16a34a' }}>Responsible</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '46%', background: '#16a34a' }}></div></div><div className="lr-pct" style={{ color: '#16a34a' }}>46%</div><div className="lr-count">5,601 veh</div></div>
            <div className="lr-row"><div className="lr-band" style={{ color: '#22c55e' }}>Average</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '61%', background: '#22c55e' }}></div></div><div className="lr-pct" style={{ color: '#22c55e' }}>61%</div><div className="lr-count">3,912 veh</div></div>
            <div className="lr-row"><div className="lr-band" style={{ color: '#f97316' }}>At Risk</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '86%', background: '#f97316' }}></div></div><div className="lr-pct" style={{ color: '#f97316' }}>86%</div><div className="lr-count">2,114 veh</div></div>
            <div className="lr-row"><div className="lr-band" style={{ color: '#7f1d1d' }}>Extreme Risk</div><div className="lr-bar-track"><div className="lr-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#7f1d1d,#ef4444)' }}></div></div><div className="lr-pct" style={{ color: '#7f1d1d' }}>132%</div><div className="lr-count">1,248 veh</div></div>
          </div>
          <div style={{ marginTop: 14, padding: 10, background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 6, fontSize: 11, color: 'var(--text2)' }}>
            ? Exemplary-band vehicles show <strong style={{ color: '#059669' }}>3.2× lower loss ratio</strong> than Extreme Risk band — actuarial significance confirmed
          </div>
        </div>
      </div>
    </div>
  );
}
