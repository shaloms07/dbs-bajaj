import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useVehicleTelemetry } from '../hooks/useVehicleTelemetry';
import {
  getDefaultTelemetryFilter,
  getTelemetryVehicles,
  TelemetryBehaviorIndicator,
  TelemetryFilter,
  VehicleTelemetryData
} from '../services/telemetryService';

type TelemetryTone = 'green' | 'yellow' | 'red';
type DatePreset = 'today' | 'yesterday' | 'last_7_days' | 'custom';
type TelemetryTab = 'all_time' | 'dashboard';

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatKm(value: number) {
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

function formatSeconds(totalSeconds: number) {
  if (!totalSeconds) return '0 sec';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return seconds ? `${minutes} min ${seconds} sec` : `${minutes} min`;
  return `${seconds} sec`;
}

function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatCoordinate(latitude: number | null, longitude: number | null) {
  return latitude != null && longitude != null ? `${latitude}, ${longitude}` : 'N/A';
}

function getMapUrl(latitude: number | null, longitude: number | null) {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function toDateTimeLocalValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 19);
}

function getPresetRange(preset: Exclude<DatePreset, 'custom'>) {
  const now = new Date();

  if (preset === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 0);
    return { startDateTime: toDateTimeLocalValue(start), endDateTime: toDateTimeLocalValue(end) };
  }

  if (preset === 'yesterday') {
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 0);
    return { startDateTime: toDateTimeLocalValue(start), endDateTime: toDateTimeLocalValue(end) };
  }

  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 0);
  return { startDateTime: toDateTimeLocalValue(start), endDateTime: toDateTimeLocalValue(end) };
}

function getAllTimeRange() {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return {
    startDateTime: toDateTimeLocalValue(start),
    endDateTime: toDateTimeLocalValue(end)
  };
}

function getOneYearWindow() {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return {
    minDateTime: toDateTimeLocalValue(start),
    maxDateTime: toDateTimeLocalValue(end)
  };
}

function getPreviousPeriodRange(filter: TelemetryFilter) {
  const start = new Date(filter.startDateTime);
  const end = new Date(filter.endDateTime);
  const durationMs = Math.max(end.getTime() - start.getTime(), 0);
  const previousEnd = new Date(start.getTime() - 1000);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    startDateTime: toDateTimeLocalValue(previousStart),
    endDateTime: toDateTimeLocalValue(previousEnd)
  };
}

function toneClass(tone: TelemetryTone) {
  return `telemetry-tone-${tone}`;
}

function indicatorTone(value: TelemetryBehaviorIndicator['tone']) {
  return value;
}

function getSeverityTone(value: VehicleTelemetryData['overspeedSeverity'] | VehicleTelemetryData['idlingSeverity']): TelemetryTone {
  if (value === 'high_risk' || value === 'critical') return 'red';
  if (value === 'moderate' || value === 'warning') return 'yellow';
  return 'green';
}

function getDistanceTrend(current: number, previous?: number) {
  if (previous == null) return null;
  if (previous === 0) {
    return {
      text: current > 0 ? 'New activity in this period' : 'No change from previous period',
      tone: current > 0 ? 'green' : 'yellow'
    } as const;
  }

  const pct = ((current - previous) / previous) * 100;
  return {
    text: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs previous period`,
    tone: pct >= 0 ? 'green' : 'yellow'
  } as const;
}

function TooltipShell({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="telemetry-tooltip">
      <div className="telemetry-tooltip-label">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="telemetry-tooltip-row">
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ExactLocationCell({
  latitude,
  longitude
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const mapUrl = getMapUrl(latitude, longitude);

  return (
    <div className="telemetry-location-cell">
      <strong>{formatCoordinate(latitude, longitude)}</strong>
      {mapUrl ? (
        <a href={mapUrl} target="_blank" rel="noreferrer">
          Open map
        </a>
      ) : (
        <span>Location unavailable</span>
      )}
    </div>
  );
}

function TelemetryDashboardContent({
  data,
  previousData,
  filter,
  dayNightChartData,
  behaviorIndicators
}: {
  data: VehicleTelemetryData;
  previousData?: VehicleTelemetryData;
  filter: TelemetryFilter;
  dayNightChartData: Array<{ name: string; value: number; color: string }>;
  behaviorIndicators: TelemetryBehaviorIndicator[];
}) {
  const [visibleTripCount, setVisibleTripCount] = useState(10);
  const [showIdlingDetails, setShowIdlingDetails] = useState(false);

  useEffect(() => {
    setVisibleTripCount(10);
    setShowIdlingDetails(false);
  }, [data.vehicleNumber, data.tripSegments.length]);

  const visibleTrips = data.tripSegments.slice(0, visibleTripCount);
  const hasMoreTrips = data.tripSegments.length > visibleTripCount;
  const terrainChartData = [
    { name: 'Urban', value: Number(data.urbanDrivingPct.toFixed(1)), color: '#005dac' },
    { name: 'Rural', value: Number(data.ruralDrivingPct.toFixed(1)), color: '#0b8666' },
    { name: 'Hilly', value: Number(data.hillyDrivingPct.toFixed(1)), color: '#d29b00' }
  ];
  const distanceTrend = getDistanceTrend(data.totalDistanceKm, previousData?.totalDistanceKm);

  return (
    <>
      <section className="telemetry-insights-grid">
        {data.insights.map((insight) => (
          <div key={insight} className="card telemetry-insight-card">
            <div className="telemetry-summary-label">Smart Insight</div>
            <p>{insight}</p>
          </div>
        ))}
      </section>

      <section className="telemetry-section-header">
        <div>
          <p className="api-eyebrow">Terrain Analysis</p>
          <h2>Terrain classification and operating mix</h2>
        </div>
      </section>

      <section className="telemetry-kpi-feature-grid">
        <div className="card telemetry-kpi-card">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Terrain Classification</div>
              <div className="telemetry-panel-subtitle">Default terrain mix, ready for future terrain enrichment</div>
            </div>
          </div>
          <div className="telemetry-chart-two-up">
            <div className="telemetry-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={terrainChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {terrainChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipShell />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="telemetry-side-metrics">
              <div className="telemetry-side-metric">
                <span>Urban</span>
                <strong>{formatPercent(data.urbanDrivingPct)}</strong>
                <small>{formatKm(data.urbanDrivingKm)}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Rural</span>
                <strong>{formatPercent(data.ruralDrivingPct)}</strong>
                <small>{formatKm(data.ruralDrivingKm)}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Hilly</span>
                <strong>{formatPercent(data.hillyDrivingPct)}</strong>
                <small>{formatKm(data.hillyDrivingKm)}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Terrain Mix</div>
              <div className="telemetry-panel-subtitle">Current terrain defaults are placeholders until route classification is connected</div>
            </div>
          </div>
          <div className="telemetry-progress-stack">
            <div className="telemetry-progress-block">
              <div className="telemetry-progress-row">
                <span>Urban Driving</span>
                <strong>{formatKm(data.urbanDrivingKm)} - {formatPercent(data.urbanDrivingPct)}</strong>
              </div>
              <div className="telemetry-progress-track">
                <div className="telemetry-progress-fill telemetry-tone-green" style={{ width: `${data.urbanDrivingPct}%` }} />
              </div>
            </div>
            <div className="telemetry-progress-block">
              <div className="telemetry-progress-row">
                <span>Rural Driving</span>
                <strong>{formatKm(data.ruralDrivingKm)} - {formatPercent(data.ruralDrivingPct)}</strong>
              </div>
              <div className="telemetry-progress-track">
                <div className="telemetry-progress-fill telemetry-tone-yellow" style={{ width: `${data.ruralDrivingPct}%` }} />
              </div>
            </div>
            <div className="telemetry-progress-block">
              <div className="telemetry-progress-row">
                <span>Hilly Driving</span>
                <strong>{formatKm(data.hillyDrivingKm)} - {formatPercent(data.hillyDrivingPct)}</strong>
              </div>
              <div className="telemetry-progress-track">
                <div className="telemetry-progress-fill telemetry-tone-red" style={{ width: `${data.hillyDrivingPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="telemetry-section-header telemetry-section-header-compact">
        <div>
          <p className="api-eyebrow">Speed & Distance</p>
          <h2>Utilization, speed profile, and overspeed review</h2>
        </div>
      </section>

      <section className="telemetry-kpi-grid telemetry-kpi-grid--two">
        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Total Distance Driven</div>
          <div className="telemetry-summary-value">{formatKm(data.totalDistanceKm)}</div>
          <div className="telemetry-summary-note">Selected period utilization</div>
          <div className={`telemetry-kpi-badge ${toneClass(distanceTrend?.tone ?? 'green')}`}>
            {distanceTrend?.text ?? 'Trend unavailable'}
          </div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Overspeeding</div>
          <div className="telemetry-kpi-stat-grid">
            <div>
              <span>Total Events</span>
              <strong>{data.overspeedCount}</strong>
            </div>
            <div>
              <span>Highest Speed</span>
              <strong>{Math.round(data.maxSpeed)} km/h</strong>
            </div>
            <div>
              <span>Above Threshold</span>
              <strong>{formatMinutes(data.overspeedDurationMinutes)}</strong>
            </div>
          </div>
          <div className={`telemetry-kpi-badge ${toneClass(getSeverityTone(data.overspeedSeverity))}`}>
            {data.overspeedSeverity === 'high_risk' ? 'High Risk' : data.overspeedSeverity === 'moderate' ? 'Moderate' : 'Normal'}
          </div>
        </div>
      </section>

      <section className="telemetry-panel-grid">
        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Speed Trend</div>
              <div className="telemetry-panel-subtitle">Time-wise for short ranges, daily average speed for longer ranges</div>
            </div>
          </div>
          <div className="telemetry-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.speedTrend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={42} />
                <Tooltip content={<TooltipShell />} />
                <Line type="monotone" dataKey="speed" stroke="#005dac" strokeWidth={3} dot={false} name="Speed (km/h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Distance Trend</div>
              <div className="telemetry-panel-subtitle">Trip-wise for short ranges, daily distance driven for longer ranges</div>
            </div>
          </div>
          <div className="telemetry-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.distanceTrend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<TooltipShell />} />
                <Area type="monotone" dataKey="distanceKm" stroke="#0b8666" fill="rgba(11, 134, 102, 0.18)" name="Distance (km)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card telemetry-panel">
        <div className="telemetry-panel-head">
          <div>
            <div className="card-title">Overspeeding Instances</div>
            <div className="telemetry-panel-subtitle">From OverSpeed Report overSpeedData; duration uses the report summary</div>
          </div>
        </div>
        <div className="telemetry-table-wrap">
          <table className="usage-billing-table telemetry-table">
            <thead>
              <tr>
                <th>Instance</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Peak Speed</th>
                <th>Start Location</th>
                <th>End Location</th>
              </tr>
            </thead>
            <tbody>
              {data.overspeedInstances.length ? (
                data.overspeedInstances.map((instance, index) => (
                  <tr key={instance.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#{index + 1}</td>
                    <td>{formatDateTime(instance.startTime)}</td>
                    <td>{formatDateTime(instance.endTime)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatMinutes(instance.durationMinutes)}</td>
                    <td>
                      <span className={`telemetry-inline-pill ${toneClass(instance.peakSpeed >= 80 ? 'red' : 'yellow')}`}>
                        {Math.round(instance.peakSpeed)} km/h
                      </span>
                    </td>
                    <td>
                      <ExactLocationCell latitude={instance.startLatitude} longitude={instance.startLongitude} />
                    </td>
                    <td>
                      <ExactLocationCell latitude={instance.endLatitude} longitude={instance.endLongitude} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="telemetry-empty-table">
                    No overspeed instances were detected for this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="telemetry-section-header telemetry-section-header-compact">
        <div>
          <p className="api-eyebrow">Day & Night</p>
          <h2>Time-of-day driving behavior</h2>
        </div>
      </section>

      <section className="telemetry-kpi-feature-grid">
        <div className="card telemetry-kpi-card">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Day vs Night Driving</div>
              <div className="telemetry-panel-subtitle">Distance split using the 6 AM / 6 PM driving window rule</div>
            </div>
          </div>
          <div className="telemetry-chart-two-up">
            <div className="telemetry-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dayNightChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {dayNightChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipShell />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="telemetry-side-metrics">
              <div className="telemetry-side-metric">
                <span>Day driving</span>
                <strong>{formatKm(data.dayDrivingKm)}</strong>
                <small>{formatPercent(data.dayDrivingPct)} - {formatMinutes(data.dayDrivingMinutes)}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Night driving</span>
                <strong>{formatKm(data.nightDrivingKm)}</strong>
                <small>{formatPercent(data.nightDrivingPct)} - {formatMinutes(data.nightDrivingMinutes)}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Driving Behaviour Indicators</div>
              <div className="telemetry-panel-subtitle">Time-of-day and movement heuristics for quick review</div>
            </div>
          </div>
          <div className="telemetry-indicator-grid">
            {behaviorIndicators.map((indicator) => (
              <div key={indicator.label} className={`telemetry-indicator-card ${toneClass(indicatorTone(indicator.tone))}`}>
                <div className="telemetry-indicator-head">
                  <span className={`telemetry-indicator-dot ${toneClass(indicatorTone(indicator.tone))}`} />
                  <strong>{indicator.label}</strong>
                </div>
                <p>{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="telemetry-section-header telemetry-section-header-compact">
        <div>
          <p className="api-eyebrow">Idling & Ignition</p>
          <h2>Idle behavior and ignition session analysis</h2>
        </div>
      </section>

      <section className="telemetry-kpi-grid telemetry-kpi-grid--two">
        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Vehicle Idling</div>
          <div className="telemetry-kpi-stat-grid">
            <div>
              <span>Total Idling</span>
              <strong>{formatSeconds(data.totalIdlingSeconds)}</strong>
            </div>
            <div>
              <span>Ignition Cycles</span>
              <strong>{data.ignitionCycles}</strong>
            </div>
            <div>
              <span>Risk Score</span>
              <strong>{data.idlingRiskScore}/100</strong>
            </div>
          </div>
          <div className="telemetry-idling-mini-grid">
            <div>
              <span>Longest Idle</span>
              <strong>{formatSeconds(data.longestIdleSessionSeconds)}</strong>
            </div>
            <div>
              <span>Average Idle</span>
              <strong>{formatSeconds(data.averageIdleSessionSeconds)}</strong>
            </div>
            <div>
              <span>Idle Sessions</span>
              <strong>{data.idleSessionCount}</strong>
            </div>
          </div>
          <div className="telemetry-kpi-actions">
            <div className={`telemetry-kpi-badge ${toneClass(getSeverityTone(data.idlingSeverity))}`}>
              {data.idlingSeverity === 'critical' ? 'Critical' : data.idlingSeverity === 'warning' ? 'Warning' : 'Normal'}
            </div>
            {data.idlingSessions.length ? (
              <button type="button" className="lookup-btn telemetry-detail-btn" onClick={() => setShowIdlingDetails(true)}>
                View Detailed Idling Events
              </button>
            ) : null}
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Idling Intelligence</div>
              <div className="telemetry-panel-subtitle">Computed from GetIdlingStatusReport without exposing raw event tables</div>
            </div>
          </div>
          <div className="telemetry-idling-summary">
            <div className="telemetry-idling-summary-row">
              <span>Total Idling Time</span>
              <strong>{formatSeconds(data.totalIdlingSeconds)}</strong>
            </div>
            <div className="telemetry-idling-summary-row">
              <span>Ignition Cycles</span>
              <strong>{data.ignitionCycles}</strong>
            </div>
            <div className="telemetry-idling-summary-row">
              <span>Longest Idle Session</span>
              <strong>{formatSeconds(data.longestIdleSessionSeconds)}</strong>
            </div>
            <div className="telemetry-idling-summary-row">
              <span>Average Idle Session</span>
              <strong>{formatSeconds(data.averageIdleSessionSeconds)}</strong>
            </div>
            <div className="telemetry-idling-summary-row">
              <span>Idle Sessions</span>
              <strong>{data.idleSessionCount}</strong>
            </div>
            <div className="telemetry-idling-summary-row">
              <span>Risk Score</span>
              <strong>{data.idlingRiskScore}/100</strong>
            </div>
          </div>
          <div className={`telemetry-kpi-badge ${toneClass(getSeverityTone(data.idlingSeverity))}`}>
            {data.idlingSeverity === 'critical' ? 'Critical' : data.idlingSeverity === 'warning' ? 'Warning' : 'Normal'}
          </div>
        </div>
      </section>

      <section className="telemetry-panel-grid">
        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Speed Events Timeline</div>
              <div className="telemetry-panel-subtitle">Recent high-signal speed events and driving activity timeline</div>
            </div>
          </div>
          <div className="telemetry-events-list">
            {data.speedEvents.length ? (
              data.speedEvents.map((event) => (
                <div key={`${event.label}-${event.details}`} className="telemetry-event-row">
                  <span className={`telemetry-event-pill ${toneClass(event.tone)}`}>{event.label}</span>
                  <div className="telemetry-event-copy">{event.details}</div>
                </div>
              ))
            ) : (
              <div className="telemetry-empty-state">No speed events were returned for this range.</div>
            )}
          </div>
          <div className="telemetry-activity-chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.activityTimeline}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={42} />
                <Tooltip content={<TooltipShell />} />
                <Bar dataKey="durationMinutes" radius={[6, 6, 0, 0]} name="Duration (min)">
                  {data.activityTimeline.map((entry) => (
                    <Cell key={entry.label} fill={entry.tone === 'red' ? '#c92a2a' : entry.tone === 'yellow' ? '#d29b00' : '#0b8666'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Ignition Trip Timeline</div>
              <div className="telemetry-panel-subtitle">Trips derived from ignition on/off sessions with distance enrichment</div>
            </div>
          </div>
          <div className="telemetry-table-wrap">
            <table className="usage-billing-table telemetry-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Ignition On</th>
                  <th>Ignition Off</th>
                  <th>Duration</th>
                  <th>Distance</th>
                  <th>Start Location</th>
                  <th>End Location</th>
                </tr>
              </thead>
              <tbody>
                {data.tripSegments.length ? (
                  visibleTrips.map((trip, index) => {
                    const tripTone: TelemetryTone =
                      trip.distanceKm >= 10 || trip.durationMinutes >= 30 ? 'red' : trip.distanceKm >= 4 ? 'yellow' : 'green';
                    return (
                      <tr key={trip.id}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>#{index + 1}</td>
                        <td>{formatDateTime(trip.startTime)}</td>
                        <td>{formatDateTime(trip.endTime)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{formatMinutes(trip.durationMinutes)}</td>
                        <td>
                          <span className={`telemetry-inline-pill ${toneClass(tripTone)}`}>{formatKm(trip.distanceKm)}</span>
                        </td>
                        <td>
                          <ExactLocationCell latitude={trip.startLatitude} longitude={trip.startLongitude} />
                        </td>
                        <td>
                          <ExactLocationCell latitude={trip.endLatitude} longitude={trip.endLongitude} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="telemetry-empty-table">
                      No ignition trip sessions were returned for this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {hasMoreTrips ? (
            <div className="telemetry-table-actions">
              <button type="button" className="lookup-btn telemetry-show-more-btn" onClick={() => setVisibleTripCount((count) => count + 10)}>
                Show more
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {showIdlingDetails ? (
        <div className="telemetry-modal-backdrop" onClick={() => setShowIdlingDetails(false)}>
          <div className="card telemetry-modal" onClick={(event) => event.stopPropagation()}>
            <div className="telemetry-panel-head">
              <div>
                <div className="card-title">Detailed Idling Events</div>
                <div className="telemetry-panel-subtitle">Expanded on demand for operational review</div>
              </div>
              <button type="button" className="lookup-btn telemetry-detail-btn" onClick={() => setShowIdlingDetails(false)}>
                Close
              </button>
            </div>
            <div className="telemetry-idling-events">
              {data.idlingSessions.map((session, index) => (
                <div key={session.id} className="telemetry-idling-event">
                  <div className="telemetry-summary-label">Idle Session #{index + 1}</div>
                  <strong>{formatSeconds(session.durationSeconds)}</strong>
                  <small>{formatDateTime(session.startTime)} to {formatDateTime(session.endTime)}</small>
                  <div className="telemetry-location-pair">
                    <ExactLocationCell latitude={session.startLatitude} longitude={session.startLongitude} />
                    <ExactLocationCell latitude={session.endLatitude} longitude={session.endLongitude} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function VehicleTelemetry() {
  const vehicles = useMemo(() => getTelemetryVehicles(), []);
  const defaultFilter = useMemo(() => getDefaultTelemetryFilter(), []);
  const [activeTab, setActiveTab] = useState<TelemetryTab>('all_time');
  const [preset, setPreset] = useState<DatePreset>('yesterday');
  const [draftFilter, setDraftFilter] = useState<TelemetryFilter>(defaultFilter);
  const [appliedFilter, setAppliedFilter] = useState<TelemetryFilter>(defaultFilter);
  const [rangeError, setRangeError] = useState('');
  const telemetry = useVehicleTelemetry(appliedFilter);
  const allTimeFilter = useMemo(
    () => ({
      vehicleNumber: draftFilter.vehicleNumber,
      bbid: draftFilter.bbid,
      customerId: draftFilter.customerId,
      ...getAllTimeRange()
    }),
    [draftFilter.vehicleNumber, draftFilter.bbid, draftFilter.customerId]
  );
  const previousFilter = useMemo(
    () => ({
      vehicleNumber: appliedFilter.vehicleNumber,
      bbid: appliedFilter.bbid,
      customerId: appliedFilter.customerId,
      ...getPreviousPeriodRange(appliedFilter)
    }),
    [appliedFilter]
  );
  const allTimePreviousFilter = useMemo(
    () => ({
      vehicleNumber: allTimeFilter.vehicleNumber,
      bbid: allTimeFilter.bbid,
      customerId: allTimeFilter.customerId,
      startDateTime: toDateTimeLocalValue(new Date(new Date(allTimeFilter.startDateTime).setFullYear(new Date(allTimeFilter.startDateTime).getFullYear() - 1))),
      endDateTime: toDateTimeLocalValue(new Date(new Date(allTimeFilter.endDateTime).setFullYear(new Date(allTimeFilter.endDateTime).getFullYear() - 1)))
    }),
    [allTimeFilter]
  );
  const allTimeTelemetry = useVehicleTelemetry(allTimeFilter);
  const previousTelemetry = useVehicleTelemetry(previousFilter);
  const allTimePreviousTelemetry = useVehicleTelemetry(allTimePreviousFilter);

  const dayNightChartData = telemetry.data
    ? [
        { name: 'Day km', value: Number(telemetry.data.dayDrivingKm.toFixed(1)), color: '#0b8666' },
        { name: 'Night km', value: Number(telemetry.data.nightDrivingKm.toFixed(1)), color: '#d29b00' }
      ]
    : [];
  const allTimeDayNightChartData = allTimeTelemetry.data
    ? [
        { name: 'Day km', value: Number(allTimeTelemetry.data.dayDrivingKm.toFixed(1)), color: '#0b8666' },
        { name: 'Night km', value: Number(allTimeTelemetry.data.nightDrivingKm.toFixed(1)), color: '#d29b00' }
      ]
    : [];

  const behaviorIndicators = telemetry.data?.behaviorIndicators ?? [];
  const allTimeBehaviorIndicators = allTimeTelemetry.data?.behaviorIndicators ?? [];

  const onVehicleChange = (vehicleNumber: string) => {
    const selectedVehicle = vehicles.find((vehicle) => vehicle.vehicleNumber === vehicleNumber) ?? vehicles[0];
    setDraftFilter((current) => ({
      ...current,
      vehicleNumber: selectedVehicle.vehicleNumber,
      bbid: selectedVehicle.bbid,
      customerId: selectedVehicle.customerId
    }));
  };

  const applyFilter = (event: FormEvent) => {
    event.preventDefault();
    const nextFilter =
      preset === 'custom'
        ? draftFilter
        : {
            ...draftFilter,
            ...getPresetRange(preset as Exclude<DatePreset, 'custom'>)
          };

    if (nextFilter.startDateTime > nextFilter.endDateTime) {
      setRangeError('Start date must be earlier than or equal to end date.');
      return;
    }

    setRangeError('');
    setAppliedFilter(nextFilter);
  };

  return (
    <div className="telemetry-page">
      <section className="card telemetry-hero">
        <div className="telemetry-hero-copy">
          <p className="api-eyebrow">Connected car analytics</p>
          <h1>Vehicle Telemetry</h1>
          <p>
            Deep-dive speed, distance, trip segmentation, and behaviour analytics for a selected vehicle using the
            existing telemetry feeds.
          </p>
          <div className="tabs telemetry-tabs">
            <button type="button" className={`tab ${activeTab === 'all_time' ? 'active' : ''}`} onClick={() => setActiveTab('all_time')}>
              Last 1 Year Data
            </button>
            <button type="button" className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              Filtered View
            </button>
          </div>
        </div>
        {activeTab === 'all_time' ? (
          <div className="telemetry-filter-bar">
            <div className="telemetry-filter-grid telemetry-filter-grid--single">
              <label className="telemetry-filter-field">
                <span>Vehicle</span>
                <select value={draftFilter.vehicleNumber} onChange={(event) => onVehicleChange(event.target.value)}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                      {vehicle.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="telemetry-filter-actions">
              <div className="telemetry-filter-meta">
                <span>Range</span>
                <strong>Rolling last 12 months</strong>
                <small>Vehicle-wide rollup using the last 1 year from the existing Trackmaster feeds</small>
              </div>
            </div>
          </div>
        ) : (
          <>
            <form className="telemetry-filter-bar" onSubmit={applyFilter}>
              <div className="telemetry-filter-grid">
                <label className="telemetry-filter-field">
                  <span>Range</span>
                  <select value={preset} onChange={(event) => setPreset(event.target.value as DatePreset)}>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                </label>
                <label className="telemetry-filter-field">
                  <span>Vehicle</span>
                  <select value={draftFilter.vehicleNumber} onChange={(event) => onVehicleChange(event.target.value)}>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                        {vehicle.label}
                      </option>
                    ))}
                  </select>
                </label>
                {preset === 'custom' ? (
                  <>
                    <label className="telemetry-filter-field">
                      <span>Start date & time</span>
                      <input
                        type="datetime-local"
                        step="1"
                        value={draftFilter.startDateTime}
                        onChange={(event) => setDraftFilter((current) => ({ ...current, startDateTime: event.target.value }))}
                      />
                    </label>
                    <label className="telemetry-filter-field">
                      <span>End date & time</span>
                      <input
                        type="datetime-local"
                        step="1"
                        value={draftFilter.endDateTime}
                        onChange={(event) => setDraftFilter((current) => ({ ...current, endDateTime: event.target.value }))}
                      />
                    </label>
                  </>
                ) : null}
              </div>
              <div className="telemetry-filter-actions">
                <div className="telemetry-filter-meta">
                  <span>Vehicle Number</span>
                  <strong>{draftFilter.vehicleNumber}</strong>
                </div>
                <button type="submit" className="lookup-btn">
                  Apply Range
                </button>
              </div>
            </form>
            {rangeError ? <div className="telemetry-error-inline">{rangeError}</div> : null}
          </>
        )}
      </section>

      {activeTab === 'all_time' && allTimeTelemetry.isLoading ? (
        <div className="telemetry-loading-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card telemetry-summary-card">
              <div className="skeleton skeleton-line skeleton-line-sm" />
              <div className="skeleton skeleton-number" style={{ marginTop: 14 }} />
              <div className="skeleton skeleton-line skeleton-line-xs" style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'dashboard' && telemetry.isLoading ? (
        <div className="telemetry-loading-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card telemetry-summary-card">
              <div className="skeleton skeleton-line skeleton-line-sm" />
              <div className="skeleton skeleton-number" style={{ marginTop: 14 }} />
              <div className="skeleton skeleton-line skeleton-line-xs" style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'all_time' && allTimeTelemetry.error ? (
        <section className="card telemetry-error-card">
          <div className="card-title">Telemetry feed unavailable</div>
          <p>{allTimeTelemetry.error.message}</p>
          <small>
            If this request is being made directly from the browser, the Trackmaster APIs may also require CORS or
            proxy support depending on the environment.
          </small>
        </section>
      ) : null}

      {activeTab === 'dashboard' && telemetry.error ? (
        <section className="card telemetry-error-card">
          <div className="card-title">Telemetry feed unavailable</div>
          <p>{telemetry.error.message}</p>
          <small>
            If this request is being made directly from the browser, the Trackmaster APIs may also require CORS or
            proxy support depending on the environment.
          </small>
        </section>
      ) : null}

      {activeTab === 'all_time' && allTimeTelemetry.data ? (
        <TelemetryDashboardContent
          data={allTimeTelemetry.data}
          previousData={allTimePreviousTelemetry.data}
          filter={allTimeFilter}
          dayNightChartData={allTimeDayNightChartData}
          behaviorIndicators={allTimeBehaviorIndicators}
        />
      ) : null}

      {activeTab === 'dashboard' && telemetry.data ? (
        <TelemetryDashboardContent
          data={telemetry.data}
          previousData={previousTelemetry.data}
          filter={appliedFilter}
          dayNightChartData={dayNightChartData}
          behaviorIndicators={behaviorIndicators}
        />
      ) : null}
    </div>
  );
}
