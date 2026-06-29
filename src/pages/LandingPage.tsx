import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import dbscoreLogo from "../assets/dbscore-wordmark.png";

const stats = [
  {
    value: "Blind Pricing",
    label: `Today's underwriting cannot distinguish a reckless driver from a safe one — both pay the same premium.`,
  },
  {
    value: "Severity-Weighted Scoring",
    label:
      "Not all violations are equal. A drunk driving record should weigh far more than a parking fine. DBS prices that difference precisely",
  },
  {
    value: "One Unified Score",
    label:
      "Enforcement records, telematics, and mobility data — brought together into a single score underwriters can act on.",
  },
];

const platformCards = [
  [
    "Beyond proxies",
    "Behavioural Evidence Beyond the Vehicle",
    "DBS goes beyond conventional underwriting inputs by layering in actual behavioural data specific to that registration number. Additional intelligence, not a replacement for existing underwriting judgment.",
  ],
  [
    "Quotation & renewal",
    "Actionable at the Point of Decision",
    "The DBS output, score, risk band is available at quotation or renewal, ready to apply without manual interpretation or additional data retrieval.",
  ],
  [
    "Full audit trail",
    "Defensible Under Scrutiny",
    "Every score is traceable to the underlying data records that generated it. When a policyholder disputes a loading, the underwriter has a documented, data-backed audit trail.",
  ],
];

const phases = [
  {
    id: "Phase 01",
    name: "Enforcement Records",
    status: "Active",
    statusClass: "active",
    source: "Traffic Violation Data",
    body: "Traffic violation records covering the full spectrum of Motor Vehicles Act offences, from drunk driving and dangerous driving to signal violations and wrong parking. Universally available across all vehicle categories and geographies.",
  },
  {
    id: "Phase 02",
    name: "Telematics Data",
    status: "In Development",
    statusClass: "dev",
    source: "Vehicle Telematics",
    body: "Vehicle telematics introduces a continuous behavioural layer: speed behaviour, driving patterns, night driving frequency, response to road and traffic conditions, and trip-level characteristics.",
  },
  {
    id: "Phase 03",
    name: "Transport Ecosystem Data",
    status: "Planned",
    statusClass: "plan",
    source: "Broader Ecosystem Sources",
    body: "DBS is designed to incorporate additional data sources from the broader transport and mobility ecosystem as the platform matures, with each source validated for data quality and actuarial relevance.",
  },
];

const thzBlocks = [
  {
    className: "thz-critical",
    tier: "Critical",
    desc: "Highest weight in scoring. Directly linked to serious road casualties.",
    items: [
      "Drunk / Drugged Driving",
      "Dangerous / Reckless Driving",
      "Disobeying Authority / Evading Enforcement",
    ],
  },
  {
    className: "thz-major",
    tier: "Major",
    desc: "Significant risk behaviours with high accident correlation.",
    items: [
      "Overspeeding",
      "No Valid Licence / No Valid Insurance",
      "Wrong Lane / Wrong Side of Road",
    ],
  },
  {
    className: "thz-moderate",
    tier: "Moderate",
    desc: "Repeated violations in this tier indicate a pattern of non-compliance.",
    items: [
      "Hazardous Goods Transport Violation",
      "Traffic Signal Violation",
      "Vehicle Overloading",
    ],
  },
  {
    className: "thz-minor",
    tier: "Minor",
    desc: "Lower individual weight but frequency of these signals risk complacency.",
    items: [
      "No Helmet / No Seatbelt / Safety Violations",
      "Unauthorised Vehicle Modifications",
      "Wrong Parking",
    ],
  },
];

const underwriterCards = [
  [
    "Lookup",
    "Individual Vehicle Query",
    "Query any vehicle registration number at quotation or renewal. Receive the DBS score, risk band, violation category breakdown.",
  ],
  [
    "Renewal",
    "Batch Portfolio Processing",
    "Submit a portfolio of registration numbers for bulk scoring at renewal. Receive structured scores, band classifications, and loading recommendations.",
  ],
  [
    "Integration",
    "REST API",
    "A versioned, documented REST API for direct integration into policy management, pricing, or underwriting platforms.",
  ],
  [
    "Analytics",
    "Portfolio Risk Analytics",
    "Analyse risk band concentration by vehicle class, geography, sum insured bracket, or policy vintage.",
  ],
  [
    "Compliance",
    "Audit-Ready Traceability",
    "Every DBS score is traceable to the underlying records that generated it, supporting audit, compliance review, and dispute resolution.",
  ],
  [
    "Strategy",
    "Adverse Selection Defence",
    "Incorporating DBS signals helps attract lower-risk vehicles and reprice higher-risk ones at renewal.",
  ],
];

const workflow = [
  [
    "01",
    "Query",
    "Submit the Vehicle Registration Number",
    "Enter the registration number via the DBS dashboard or API at quotation or renewal. The system retrieves the vehicle's behavioural data record automatically.",
  ],
  [
    "02",
    "Score",
    "Receive the DBS score and risk band",
    "The scoring engine returns a DBS score and risk band — a standardised, severity-weighted view of the vehicle's behavioural history, ready for underwriting review.",
  ],
  [
    "03",
    "Audit",
    "Every query, fully traceable",
    "Every score and risk band is logged and linked to the underlying data records — supporting compliance review, regulatory reporting, and dispute resolution.",
  ],
];

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: June 2026",
    intro:
      "This Privacy Policy explains how Social-Impact Innovations Pvt. Ltd. handles information through the Driver Behaviour Score platform and dbscore.in.",
    sections: [
      [
        "Information We Process",
        "DBS is designed for authorised insurer workflows and processes vehicle-level behavioural signals such as registration number inputs, enforcement record references, score outputs, risk bands, query logs, and authorised user account details.",
      ],
      [
        "How We Use Information",
        "Information is used to generate DBS scores, support underwriting decisions, maintain audit trails, improve platform reliability, prevent misuse, and respond to insurer support or compliance requests.",
      ],
      [
        "Personal Data Position",
        "The landing page does not collect personal identification information. Platform access is restricted to authorised insurers, and DBS score outputs are intended to be vehicle-level underwriting intelligence.",
      ],
      [
        "Data Sharing",
        "We share platform information only with authorised insurer users, service providers supporting platform operations, and regulatory or legal authorities where required by law or a formal process.",
      ],
      [
        "Security and Retention",
        "We apply reasonable technical and organisational safeguards and retain records only for operational, contractual, audit, legal, and compliance purposes.",
      ],
      [
        "Contact",
        "For privacy questions, data requests, or DPDP Act related enquiries, contact contact@social-impact.in.",
      ],
    ],
  },
  terms: {
    title: "Terms and Conditions",
    updated: "Last updated: June 2026",
    intro:
      "These Terms and Conditions govern use of dbscore.in and the Driver Behaviour Score platform operated by Social-Impact Innovations Pvt. Ltd.",
    sections: [
      [
        "Authorised Use",
        "DBS is intended only for authorised insurers, underwriting teams, and approved representatives under a formal access arrangement or Data Access Agreement.",
      ],
      [
        "Permitted Purpose",
        "Users may use DBS outputs for motor insurance underwriting, quotation, renewal, portfolio analysis, audit review, and related internal business purposes.",
      ],
      [
        "No Consumer Access",
        "The platform is not a public consumer credit, identity, or personal profiling service. Unauthorised access, scraping, reverse engineering, or misuse of score outputs is prohibited.",
      ],
      [
        "Underwriting Responsibility",
        "DBS provides data-backed risk intelligence and recommended modifiers. Final pricing, eligibility, compliance, customer communication, and underwriting decisions remain the responsibility of the insurer.",
      ],
      [
        "Accuracy and Availability",
        "We work to maintain reliable data processing and platform availability, but DBS outputs depend on source data quality, availability, and validation status. Services may change as data sources and scoring models evolve.",
      ],
      [
        "Contact",
        "For access, contract, or terms-related questions, contact contact@social-impact.in.",
      ],
    ],
  },
} as const;

type LegalModalKey = keyof typeof legalContent;

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeModal, setActiveModal] = useState<LegalModalKey | null>(null);

  useEffect(() => {
    document.title = "Driver Behaviour Score - dbscore.in";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".dbs-landing .reveal")
      .forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!activeModal) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const goToApp = () => navigate(isAuthenticated ? "/lookup" : "/login");
  const modalContent = activeModal ? legalContent[activeModal] : null;

  return (
    <div className="dbs-landing" id="top">
      <nav className="dbs-nav">
        <a className="nav-logo" href="#top" aria-label="dbscore home">
          <img src={dbscoreLogo} alt="dbscore" />
        </a>
        <ul className="nav-links">
          <li>
            <a href="#platform">Platform</a>
          </li>
          <li>
            <a href="#data">Data Sources</a>
          </li>
          <li>
            <a href="#framework">Framework</a>
          </li>
          <li>
            <a href="#underwriters">For Underwriters</a>
          </li>
          <li>
            <button type="button" className="nav-cta" onClick={goToApp}>
              {isAuthenticated ? "Dashboard" : "Insurer Login"}
            </button>
          </li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            Motor Risk Intelligence · dbscore.in
          </div>
          <h1>
            See the risk behind
            <br />
            every vehicle.
            <br />
            <em>Before you insure it.</em>
          </h1>
          <p className="hero-desc">
            The Driver Behaviour Score aggregates a vehicle's complete
            behavioural data trail into a single, standardised underwriting
            score.
          </p>
          <div
            className="score-gauge-wrap"
            aria-label="Example DBS score 300, exemplary risk band"
          >
            <div className="score-gauge-meta">
              <span>Risk Gauge</span>
              <span>Vehicle - MH-31-AB-XXXX</span>
            </div>
            <svg
              className="score-gauge-svg"
              viewBox="0 0 264 176"
              role="img"
              aria-labelledby="gauge-title gauge-desc"
            >
              <title id="gauge-title">DBS score gauge</title>
              <desc id="gauge-desc">
                A semicircle gauge with high risk, moderate, safe, and exemplary
                bands. The score reads 300, exemplary.
              </desc>
              <path
                className="gauge-track"
                d="M32 148 A100 100 0 0 1 232 148"
                pathLength="100"
              />
              <path
                className="gauge-band gauge-band-high"
                d="M32 148 A100 100 0 0 1 232 148"
                pathLength="100"
              />
              <path
                className="gauge-band gauge-band-moderate"
                d="M32 148 A100 100 0 0 1 232 148"
                pathLength="100"
              />
              <path
                className="gauge-band gauge-band-safe"
                d="M32 148 A100 100 0 0 1 232 148"
                pathLength="100"
              />
              <path
                className="gauge-band gauge-band-exemplary"
                d="M32 148 A100 100 0 0 1 232 148"
                pathLength="100"
              />
            </svg>
            <div className="score-gauge-reading">
              <strong>264</strong>
              <span>Exemplary</span>
            </div>
            <div className="score-gauge-bands">
              <span className="b-high">High Risk</span>
              <span className="b-mod">Moderate</span>
              <span className="b-safe">Safe</span>
              <span className="b-exem">Exemplary</span>
            </div>
            <div className="score-gauge-note">
              Illustrative position only. No personal data displayed.
            </div>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={goToApp}>
              {isAuthenticated ? "Open Dashboard" : "Request Insurer Access"} →
            </button>
            <a href="#platform" className="btn-secondary">
              How It Works
            </a>
          </div>
        </div>
      </section>

      <section className="s-base" id="problem">
        <div className="s-inner">
          <div className="eyebrow">The Underwriting Gap</div>
          <h2 className="section-hed">
            Motor insurance has always priced the vehicle.
            <br />
            <em>Never the behaviour behind it.</em>
          </h2>
          <div className="pull-quote">
            <p>
              A vehicle with repeated overspeeding records, signal violations,
              and a reckless driving history carries the same premium as one
              with an unblemished record.
            </p>
          </div>
          <p className="section-lead">
            The data to distinguish them has always existed. It was simply
            fragmented — spread across enforcement systems, telematics
            infrastructure, and the transport ecosystem — with no platform to
            assemble it into a form underwriting teams could act on.
            <strong>DBS changes that.</strong>
          </p>
          <hr className="section-divider" />
          <div className="three-col">
            {stats.map((stat) => (
              <div className="card stat-card reveal" key={stat.value}>
                <div className="stat-num">{stat.value}</div>
                <div>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-white" id="platform">
        <div className="s-inner">
          <div className="eyebrow">The Platform</div>
          <h2 className="section-hed">
            The data was always there,fragmented across systems.
            <em> DBS brings it together.</em>
          </h2>
          <p className="section-lead">
            Every vehicle in India generates a continuous trail of behavioural
            data. Enforcement records. Telematics signals. Transport ecosystem
            data. This information exists: recorded, timestamped, distributed
            across multiple systems that have never spoken to each other.
          </p>
          <p className="section-lead">
            DBS is the aggregation layer. It retrieves this data, applies a
            structured severity framework, and compresses it into a single
            scored output with a risk band.
          </p>
          <hr className="section-divider" />
          <div className="three-col">
            {platformCards.map(([label, title, body]) => (
              <div className="card reveal" key={title}>
                <div className="card-label">{label}</div>
                <div className="card-title">{title}</div>
                <div className="card-body">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-alt" id="data">
        <div className="s-inner">
          <div className="eyebrow">Data Architecture</div>
          <h2 className="section-hed">
            A multi-source scoring engine.
            <br />
            <em>Built to grow with the ecosystem.</em>
          </h2>
          <p className="section-lead">
            DBS is architected to aggregate behavioural signals from multiple
            data sources across phases. The scoring framework is
            source-agnostic, so as each source is validated and integrated, the
            score becomes progressively richer without requiring changes to the
            underwriter&apos;s workflow.
          </p>
          <div className="phase-list">
            {phases.map((phase) => (
              <div className="phase-row reveal" key={phase.id}>
                <div>
                  <div className="phase-id">{phase.id}</div>
                  <div className="phase-name">{phase.name}</div>
                  <div className={`phase-pill ${phase.statusClass}`}>
                    {phase.status}
                  </div>
                </div>
                <div>
                  <div className="phase-source">{phase.source}</div>
                  <p className="phase-body">{phase.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-white" id="framework">
        <div className="s-inner">
          <div className="eyebrow">Scoring Methodology</div>
          <h2 className="section-hed">
            A structured severity framework.
            <br />
            <em>Consistent, weighted, auditable.</em>
          </h2>
          <p className="section-lead">
            DBS applies a{" "}
            <strong>Threat Hazard Zone (THZ) classification</strong> to
            behavioural inputs. Each signal is mapped to one of twelve offence
            clusters ranked by the severity of road safety risk that behaviour
            represents.
          </p>
          <div className="thz-note-card reveal">
            <div className="thz-note-label">For Authorised Insurers</div>
            <p>
              The THZ offence categories are listed below. Scoring weights,
              assessment parameters, multiplier schedules, and band thresholds
              are available to authorised insurers upon platform access.
            </p>
          </div>
          <div className="thz-four-col">
            {thzBlocks.map((block, blockIndex) => (
              <div className={`thz-block ${block.className}`} key={block.tier}>
                <div className="thz-block-header">
                  <span className="thz-block-dot" />
                  <span className="thz-block-tier">{block.tier}</span>
                </div>
                <div className="thz-block-desc">{block.desc}</div>
                <ul className="thz-block-list">
                  {block.items.map((item, itemIndex) => (
                    <li key={item}>
                      <span className="thz-block-code">
                        THZ·
                        {String(blockIndex * 3 + itemIndex + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-base" id="underwriters">
        <div className="s-inner">
          <div className="eyebrow">For Underwriters</div>
          <h2 className="section-hed">
            Everything your underwriting team needs.
            <br />
            <em>Nothing it doesn&apos;t.</em>
          </h2>
          <p className="section-lead">
            DBS is designed to fit into an insurer&apos;s existing motor
            underwriting workflow: at quotation, at renewal, and at the
            portfolio level.
          </p>
          <hr className="section-divider" />
          <div className="three-col">
            {underwriterCards.map(([label, title, body]) => (
              <div className="card reveal" key={title}>
                <div className="card-label">{label}</div>
                <div className="card-title">{title}</div>
                <div className="card-body">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-white" id="workflow">
        <div className="s-inner">
          <div className="eyebrow">Underwriter Workflow</div>
          <h2 className="section-hed">
            From registration number
            <br />
            to underwriting insight.<em>Three steps.</em>
          </h2>
          <p className="section-lead">
            A single input — the vehicle registration number — triggers the full
            DBS scoring pipeline and returns actionable behavioural intelligence
            for the underwriter to review.
          </p>
          <div className="workflow">
            {workflow.map(([number, label, title, body]) => (
              <div className="wf-step reveal" key={number}>
                <div className="wf-n">{number}</div>
                <div>
                  <div className="wf-label">{label}</div>
                  <div className="wf-title">{title}</div>
                  <div className="wf-body">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-blue" id="access">
        <div className="s-inner">
          <div className="access-grid">
            <div>
              <div className="eyebrow on-blue">Insurer Access</div>
              <h2 className="section-hed on-blue">
               Ready to bring behavioural evidence into your
                <br />
                <em>underwriting workflow?</em>
              </h2>
              <div className="access-prose">
                <p>
                  DBS is available to insurance underwriters under a formal Data
                  Access Agreement. Access includes the underwriter dashboard,
                  batch processing, REST API credentials, full technical
                  documentation, and dedicated onboarding support.
                </p>
                <p>
                  Contact us to discuss access for your team, API integration,
                  or pilot participation. We respond to all enquiries within two
                  working days.
                </p>
              </div>
            </div>
            <div className="access-card reveal">
              <div className="access-card-title">Get in Touch</div>
              <div className="contact-row">
                <div className="contact-lbl">Email</div>
                <a
                  className="contact-val"
                  href="mailto:contact@social-impact.in"
                >
                  contact@social-impact.in
                </a>
              </div>
              <div className="contact-row">
                <div className="contact-lbl">Phone</div>
                <a className="contact-val" href="tel:+919823276203">
                  +91-98232-76203
                </a>
              </div>
              <div className="contact-row">
                <div className="contact-lbl">Location</div>
                <span className="contact-val">Nagpur, Maharashtra, India</span>
              </div>
              <button type="button" className="btn-access" onClick={goToApp}>
                {isAuthenticated ? "Open Dashboard" : "Request Insurer Access"}{" "}
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="dbs-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Driver Behaviour Score</div>
            <div className="footer-tagline">
              A standardised behavioural risk score for motor insurance
              underwriting. Built on the data trail every vehicle leaves behind.
            </div>
            <div className="footer-entity">
              Operated by Social-Impact Innovations Pvt. Ltd., Nagpur,
              Maharashtra, India.
            </div>
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li>
                <a href="#platform">Platform</a>
              </li>
              <li>
                <a href="#data">Data Sources</a>
              </li>
              <li>
                <a href="#framework">THZ Framework</a>
              </li>
              <li>
                <a href="#underwriters">For Underwriters</a>
              </li>
              <li>
                <a href="#workflow">Workflow</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Legal</div>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => setActiveModal("privacy")}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveModal("terms")}>
                  Terms and Conditions
                </button>
              </li>
              <li>
                <a href="#">DPDP Compliance</a>
              </li>
              <li>
                <a href="#">Data Source Notice</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 Social-Impact Innovations Pvt. Ltd. All rights reserved.
          </div>
          <div className="footer-notice">
            DBS scores are derived from enforcement records and, in future
            phases, telematics and transport ecosystem data. Scores are
            vehicle-level only; no personal identification information is
            processed or displayed. Access restricted to authorised insurers
            under a formal Data Access Agreement. Compliant with DPDP Act, 2023.
          </div>
        </div>
      </footer>

      {modalContent ? (
        <div
          className="legal-modal-backdrop"
          role="presentation"
          onMouseDown={() => setActiveModal(null)}
        >
          <div
            className="legal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="legal-modal-header">
              <div>
                <div className="legal-modal-kicker">{modalContent.updated}</div>
                <h2 id="legal-modal-title">{modalContent.title}</h2>
              </div>
              <button
                type="button"
                className="legal-modal-close"
                aria-label="Close modal"
                onClick={() => setActiveModal(null)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="legal-modal-intro">{modalContent.intro}</p>
            <div className="legal-modal-sections">
              {modalContent.sections.map(([title, body]) => (
                <section key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
