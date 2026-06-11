import { useMemo, useState } from 'react';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getTelemetryVehicles } from '../services/telemetryService';
import { getTM100TelemetrySnapshot } from '../services/tm100TelemetryService';

function formatKm(value: number) {
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatDateTime(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
}

function formatCoordinate(latitude: number | null, longitude: number | null) {
  return latitude != null && longitude != null ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'N/A';
}

function SimpleTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
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

export default function TM100Telemetry() {
  const vehicles = useMemo(() => getTelemetryVehicles(), []);
  const [vehicleNumber, setVehicleNumber] = useState(vehicles[0]?.vehicleNumber ?? '');
  const snapshot = useMemo(() => getTM100TelemetrySnapshot(vehicleNumber), [vehicleNumber]);

  return (
    <div className="telemetry-page">
      <div className="api-hero">
        <div>
          <p className="api-eyebrow">Vehicle Telemetry</p>
          <h1>Advanced telemetry insights dashboard</h1>
          <p className="api-lead">
            This page is structured for backend-analysed telemetry stats like day and night driving, terrain context, urban and rural usage,
            trips, speed behavior, and driving event summaries.
          </p>
        </div>
      </div>

      <div className="telemetry-filter-bar">
        <div className="telemetry-filter-grid telemetry-filter-grid--single">
          <label className="telemetry-filter-field">
            <span>Vehicle</span>
            <select value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)}>
              {vehicles.map((vehicle) => (
                <option key={`${vehicle.vehicleNumber}-${vehicle.customerId}`} value={vehicle.vehicleNumber}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="telemetry-filter-actions">
          <div className="telemetry-filter-meta">
            <span>Analytics source</span>
            <strong>Server-analysed telemetry</strong>
            <small>This experience is focused on business-level telemetry metrics, not transport or ingestion structure.</small>
          </div>
        </div>
      </div>

      <section className="telemetry-kpi-grid">
        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Total Distance Driven</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{formatKm(snapshot.summary.totalDistanceKm)}</div>
            <div className="telemetry-summary-average">{snapshot.summary.totalTrips} trips</div>
          </div>
          <div className="telemetry-summary-note">Overall distance driven in the selected telemetry period</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Day Driving</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{formatKm(snapshot.summary.dayDrivingKm)}</div>
            <div className="telemetry-summary-average">
              {snapshot.summary.totalDistanceKm > 0 ? `${((snapshot.summary.dayDrivingKm / snapshot.summary.totalDistanceKm) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
          <div className="telemetry-summary-note">Distance attributed to daytime driving</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Night Driving</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{formatKm(snapshot.summary.nightDrivingKm)}</div>
            <div className="telemetry-summary-average">
              {snapshot.summary.totalDistanceKm > 0 ? `${((snapshot.summary.nightDrivingKm / snapshot.summary.totalDistanceKm) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
          <div className="telemetry-summary-note">Distance attributed to nighttime driving</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Urban Driving</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{formatKm(snapshot.summary.urbanDrivingKm)}</div>
            <div className="telemetry-summary-average">estimated</div>
          </div>
          <div className="telemetry-summary-note">Estimated urban driving distance from analysed movement context</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Rural Driving</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{formatKm(snapshot.summary.ruralDrivingKm)}</div>
            <div className="telemetry-summary-average">estimated</div>
          </div>
          <div className="telemetry-summary-note">Estimated rural or open-road driving distance from analysed movement context</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Overspeed Events</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{snapshot.summary.overspeedPackets}</div>
            <div className="telemetry-summary-average">{snapshot.summary.maxSpeed} km/h max</div>
          </div>
          <div className="telemetry-summary-note">Overspeed events and top-end speed behavior in the selected range</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Emergency / Harsh Events</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{snapshot.summary.emergencyPackets}</div>
            <div className="telemetry-summary-average">{snapshot.summary.harshEventPackets} harsh</div>
          </div>
          <div className="telemetry-summary-note">Emergency and harsh driving events surfaced by the telemetry analysis layer</div>
        </div>

        <div className="card telemetry-kpi-card">
          <div className="telemetry-summary-label">Telemetry Health</div>
          <div className="telemetry-summary-value-row">
            <div className="telemetry-summary-value">{snapshot.summary.totalPackets}</div>
            <div className="telemetry-summary-average">{snapshot.summary.gpsValidPackets} GPS valid</div>
          </div>
          <div className="telemetry-summary-note">Overall telemetry sample count and GPS-valid observations available for analysis</div>
        </div>
      </section>

      <section className="telemetry-insights-grid">
        {snapshot.insights.map((insight) => (
          <div key={insight} className="card telemetry-insight-card">
            <div className="telemetry-summary-label">Telemetry Insight</div>
            <p>{insight}</p>
          </div>
        ))}
      </section>

      <section className="telemetry-panel-grid">
        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Speed Trend</div>
              <div className="telemetry-panel-subtitle">Speed trend from analysed telemetry observations</div>
            </div>
          </div>
          <div className="telemetry-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={snapshot.speedTrend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={42} />
                <Tooltip content={<SimpleTooltip />} />
                <Line type="monotone" dataKey="speed" stroke="#005dac" strokeWidth={3} dot={{ r: 3 }} name="Speed (km/h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Distance Trend</div>
              <div className="telemetry-panel-subtitle">Daily distance trend across the analysed telemetry period</div>
            </div>
          </div>
          <div className="telemetry-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={snapshot.distanceTrend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={42} />
                <Tooltip content={<SimpleTooltip />} />
                <Bar dataKey="distanceKm" radius={[6, 6, 0, 0]} fill="#0b8666" name="Distance (km)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="telemetry-panel-grid">
        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Day vs Night Driving</div>
              <div className="telemetry-panel-subtitle">Distance split using the configured day and night driving windows</div>
            </div>
          </div>
          <div className="telemetry-chart-two-up">
            <div className="telemetry-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={snapshot.dayNightMix} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                    {snapshot.dayNightMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<SimpleTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="telemetry-side-metrics">
              {snapshot.dayNightMix.map((entry) => (
                <div key={entry.name} className="telemetry-side-metric">
                  <span>{entry.name}</span>
                  <strong>{formatKm(entry.value)}</strong>
                  <small>{snapshot.summary.totalDistanceKm > 0 ? `${((entry.value / snapshot.summary.totalDistanceKm) * 100).toFixed(1)}% of distance` : '0% of distance'}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Urban vs Rural Estimate</div>
              <div className="telemetry-panel-subtitle">Analysed terrain and movement context split for urban and rural usage</div>
            </div>
          </div>
          <div className="telemetry-chart-two-up">
            <div className="telemetry-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={snapshot.terrainMix} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                    {snapshot.terrainMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<SimpleTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="telemetry-side-metrics">
              {snapshot.terrainMix.map((entry) => (
                <div key={entry.name} className="telemetry-side-metric">
                  <span>{entry.name}</span>
                  <strong>{formatKm(entry.value)}</strong>
                  <small>{snapshot.summary.totalDistanceKm > 0 ? `${((entry.value / snapshot.summary.totalDistanceKm) * 100).toFixed(1)}% of distance` : '0% of distance'}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="telemetry-panel-grid">
        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Driving Event Summary</div>
              <div className="telemetry-panel-subtitle">Counts and meanings of meaningful driving events returned by the telemetry analysis layer</div>
            </div>
          </div>
          <div className="telemetry-events-list">
            {snapshot.alertBreakdown.length ? (
              snapshot.alertBreakdown.map((item) => (
                <div key={item.code} className="telemetry-event-row">
                  <span className={`telemetry-event-pill telemetry-tone-${item.tone}`}>{item.count}</span>
                  <div className="telemetry-event-copy">{item.label}</div>
                </div>
              ))
            ) : (
              <div className="telemetry-empty-state">No driving events were returned for this vehicle sample.</div>
            )}
          </div>
        </div>

        <div className="card telemetry-panel">
          <div className="telemetry-panel-head">
            <div>
              <div className="card-title">Latest Telemetry Snapshot</div>
              <div className="telemetry-panel-subtitle">Most recent analysed telemetry observation rendered into business-readable fields</div>
            </div>
          </div>
          {snapshot.summary.latestPacket ? (
            <div className="raw-detail-grid">
              <div className="telemetry-side-metric">
                <span>Telemetry Category</span>
                <strong>{snapshot.summary.latestPacket.packetTypeLabel}</strong>
                <small>{snapshot.summary.latestPacket.familyLabel}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Timestamp</span>
                <strong>{formatDateTime(snapshot.summary.latestPacket.timestamp)}</strong>
                <small>{snapshot.summary.latestPacket.packetStatus === 'H' ? 'Historical' : 'Live telemetry'}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Vehicle / IMEI</span>
                <strong>{snapshot.summary.latestPacket.vehicleRegNo || snapshot.vehicleNumber}</strong>
                <small>{snapshot.summary.latestPacket.imei}</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Coordinates</span>
                <strong>{formatCoordinate(snapshot.summary.latestPacket.latitude, snapshot.summary.latestPacket.longitude)}</strong>
                <small>Latest mapped telemetry location</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Speed / Heading</span>
                <strong>{snapshot.summary.latestPacket.speed ?? 0} km/h</strong>
                <small>{snapshot.summary.latestPacket.heading ?? 0}° heading</small>
              </div>
              <div className="telemetry-side-metric">
                <span>Device State</span>
                <strong>
                  {snapshot.summary.latestPacket.ignition === 1
                    ? 'Ignition On'
                    : snapshot.summary.latestPacket.ignition === 0
                      ? 'Ignition Off'
                      : 'Not reported'}
                </strong>
                <small>
                  Main {snapshot.summary.latestPacket.mainVoltage ?? 'N/A'}V · Battery {snapshot.summary.latestPacket.batteryVoltage ?? 'N/A'}V
                </small>
              </div>
            </div>
          ) : (
            <div className="telemetry-empty-state">No telemetry snapshot could be shown for the selected vehicle.</div>
          )}
        </div>
      </section>

      <section className="card telemetry-panel">
        <div className="telemetry-panel-head">
          <div>
            <div className="card-title">Trip Timeline</div>
            <div className="telemetry-panel-subtitle">Trips and session-level movement summaries from analysed telemetry</div>
          </div>
        </div>
        <div className="telemetry-table-wrap">
          <table className="usage-billing-table telemetry-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Distance</th>
                <th>Avg Speed</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.tripTimeline.length ? (
                snapshot.tripTimeline.map((trip, index) => (
                  <tr key={trip.id}>
                    <td>Trip {index + 1}</td>
                    <td>{formatDateTime(trip.startTime)}</td>
                    <td>{formatDateTime(trip.endTime)}</td>
                    <td>{formatMinutes(trip.durationMinutes)}</td>
                    <td>{formatKm(trip.distanceKm)}</td>
                    <td>{trip.avgSpeed} km/h</td>
                    <td>{trip.terrainLabel}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="telemetry-empty-state">No trip summaries were returned for this vehicle sample.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
