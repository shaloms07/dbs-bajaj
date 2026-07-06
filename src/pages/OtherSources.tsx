export default function OtherSources() {
  const sources = [
    {
      name: 'VAHAN / MoRTH API',
      description:
        'Direct integration with the Ministry of Road Transport & Highways vehicle database for real-time RC and fitness data.',
      eta: 'Q3 2025',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      )
    },
    {
      name: 'Fastag / NETC Transaction Feed',
      description:
        'Highway and toll transaction data for estimating long-distance trip patterns, route preferences, and inter-city driving exposure.',
      eta: 'Q4 2025',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
      )
    },
    {
      name: 'Insurance Claim History',
      description:
        'Aggregated and anonymised claim history signals from consortium partners to better calibrate premium modifiers against historical loss data.',
      eta: 'Q1 2026',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      )
    },
    {
      name: 'Third-party Telematics Devices',
      description:
        'Adapter layer for OBD-II dongles, aftermarket GPS trackers, and fleet management systems beyond the TM100 hardware stack.',
      eta: 'Q2 2026',
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
