export default function OtherSources() {
  const sources = [
    {
      name: 'Fastag / NETC Transaction Feed',
      description:
        'Highway and toll transaction data for estimating long-distance trip patterns, route preferences, and inter-city driving exposure.',
      eta: 'Q3 2026',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
      )
    },
    {
      name: 'Third-party Telematics Devices',
      description:
        'Adapter layer for OBD-II dongles, aftermarket GPS trackers, and fleet management systems beyond the TM100 hardware stack.',
      eta: 'Q4 2026',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
        </svg>
      )
    }
  ];

  return (
    <div className="other-sources-page">
      <section className="card other-sources-hero">
        <div className="other-sources-hero-badge">Coming Soon</div>
        <h1>Other Data Sources</h1>
        <p>
          We are actively integrating additional data pipelines to enrich vehicle risk profiling beyond telematics.
          The following sources are in active development or evaluation.
        </p>
      </section>

      <div className="other-sources-grid">
        {sources.map((source) => (
          <div key={source.name} className="card other-sources-card">
            <div className="other-sources-card-icon">{source.icon}</div>
            <div className="other-sources-card-body">
              <div className="other-sources-card-name">{source.name}</div>
              <p className="other-sources-card-desc">{source.description}</p>
            </div>
            <div className="other-sources-card-eta">
              <span className="other-sources-eta-badge">{source.eta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card other-sources-contact">
        <div className="other-sources-contact-icon">
          <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 28, height: 28 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <div className="other-sources-contact-title">Want early access or have a data source to suggest?</div>
          <p className="other-sources-contact-body">
            Reach out to your DBS account manager or write to us at{' '}
            <a href="mailto:integrations@dbscore.in" className="other-sources-link">
              integrations@dbscore.in
            </a>{' '}
            to discuss custom data integrations or early access to upcoming pipelines.
          </p>
        </div>
      </div>
    </div>
  );
}
