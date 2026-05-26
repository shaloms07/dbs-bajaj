import { FormEvent, useMemo, useState } from 'react';
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

function toneClass(tone: TelemetryTone) {
  return `telemetry-tone-${tone}`;
}

function indicatorTone(value: TelemetryBehaviorIndicator['tone']) {
  return value;
}

function summaryCards(data: VehicleTelemetryData) {
  return [
    { label: 'Total Distance Travelled', value: formatKm(data.totalDistanceKm), note: 'From Distance Report TotalDistance' },
    { label: 'Total Driving Duration', value: formatMinutes(data.totalDrivingDurationMinutes), note: `${data.totalTrips} ignition sessions` },
    { label: 'Max Speed', value: `${Math.round(data.maxSpeed)} km/h`, note: 'From OverSpeed Report maxSpeed' },
    {
      label: 'Overspeed Count',
      value: data.overspeedCount.toLocaleString('en-IN'),
      note: `From OverSpeed Report overspeedCount; limit ${data.overspeedLimit} km/h`
    },
    { label: 'Day Driving', value: formatKm(data.dayDrivingKm), note: `${formatPercent(data.dayDrivingPct)} - ${formatMinutes(data.dayDrivingMinutes)}` },
    { label: 'Night Driving', value: formatKm(data.nightDrivingKm), note: `${formatPercent(data.nightDrivingPct)} - ${formatMinutes(data.nightDrivingMinutes)}` },
    { label: 'Urban Driving', value: formatKm(data.urbanDrivingKm), note: `${formatPercent(data.urbanDrivingPct)} placeholder` },
    { label: 'Rural Driving', value: formatKm(data.ruralDrivingKm), note: `${formatPercent(data.ruralDrivingPct)} placeholder` }
  ];
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

export default function VehicleTelemetry() {
  const vehicles = useMemo(() => getTelemetryVehicles(), []);
  const defaultFilter = useMemo(() => getDefaultTelemetryFilter(), []);
  const [preset, setPreset] = useState<DatePreset>('yesterday');
  const [draftFilter, setDraftFilter] = useState<TelemetryFilter>(defaultFilter);
  const [appliedFilter, setAppliedFilter] = useState<TelemetryFilter>(defaultFilter);
  const [rangeError, setRangeError] = useState('');
  const telemetry = useVehicleTelemetry(appliedFilter);

  const dayNightChartData = telemetry.data
    ? [
        { name: 'Day km', value: Number(telemetry.data.dayDrivingKm.toFixed(1)), color: '#0b8666' },
        { name: 'Night km', value: Number(telemetry.data.nightDrivingKm.toFixed(1)), color: '#d29b00' }
      ]
    : [];

  const behaviorIndicators = telemetry.data?.behaviorIndicators ?? [];

  const onVehicleChange = (vehicleNumber: string) => {
    const selectedVehicle = vehicles.find((vehicle) => vehicle.vehicleNumber === vehicleNumber) ?? vehicles[0];
    setDraftFilter((current) => ({
      ...current,
      vehicleNumber: selectedVehicle.vehicleNumber,
      bbid: selectedVehicle.bbid
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
        </div>
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
                  <option key={vehicle.bbid} value={vehicle.vehicleNumber}>
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
              {/* <small>BBID {draftFilter.bbid}</small> */}
            </div>
            <button type="submit" className="lookup-btn">
              Apply Range
            </button>
          </div>
        </form>
        {rangeError ? <div className="telemetry-error-inline">{rangeError}</div> : null}
      </section>

      {telemetry.isLoading ? (
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

      {telemetry.error ? (
        <section className="card telemetry-error-card">
          <div className="card-title">Telemetry feed unavailable</div>
          <p>{telemetry.error.message}</p>
          <small>
            If this request is being made directly from the browser, the Trackmaster APIs may also require CORS or
            proxy support depending on the environment.
          </small>
        </section>
      ) : null}

      {telemetry.data ? (
        <>
          <section className="telemetry-summary-grid">
            {summaryCards(telemetry.data).map((card) => (
              <div key={card.label} className="card telemetry-summary-card">
                <div className="telemetry-summary-label">{card.label}</div>
                <div className="telemetry-summary-value">{card.value}</div>
                <div className="telemetry-summary-note">{card.note}</div>
              </div>
            ))}
          </section>

          <section className="telemetry-panel-grid">
            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Day vs Night Driving</div>
                  <div className="telemetry-panel-subtitle">Computed from trip timestamps using the 6 AM / 6 PM rule</div>
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
                    <strong>{formatKm(telemetry.data.dayDrivingKm)}</strong>
                    <small>{formatPercent(telemetry.data.dayDrivingPct)} - {formatMinutes(telemetry.data.dayDrivingMinutes)}</small>
                  </div>
                  <div className="telemetry-side-metric">
                    <span>Night driving</span>
                    <strong>{formatKm(telemetry.data.nightDrivingKm)}</strong>
                    <small>{formatPercent(telemetry.data.nightDrivingPct)} - {formatMinutes(telemetry.data.nightDrivingMinutes)}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Driving Mix</div>
                  <div className="telemetry-panel-subtitle">Urban and rural placeholders, ready for future geofencing logic</div>
                </div>
              </div>
              <div className="telemetry-progress-stack">
                <div className="telemetry-progress-block">
                  <div className="telemetry-progress-row">
                    <span>Urban Driving</span>
                    <strong>{formatKm(telemetry.data.urbanDrivingKm)} - {formatPercent(telemetry.data.urbanDrivingPct)}</strong>
                  </div>
                  <div className="telemetry-progress-track">
                    <div className="telemetry-progress-fill telemetry-tone-green" style={{ width: `${telemetry.data.urbanDrivingPct}%` }} />
                  </div>
                </div>
                <div className="telemetry-progress-block">
                  <div className="telemetry-progress-row">
                    <span>Rural Driving</span>
                    <strong>{formatKm(telemetry.data.ruralDrivingKm)} - {formatPercent(telemetry.data.ruralDrivingPct)}</strong>
                  </div>
                  <div className="telemetry-progress-track">
                    <div className="telemetry-progress-fill telemetry-tone-yellow" style={{ width: `${telemetry.data.ruralDrivingPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="telemetry-placeholder-note">
                Urban/rural segmentation is currently static and designed for future route-based classification.
              </div>
            </div>
          </section>

          <section className="telemetry-panel-grid">
            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Speed Trend</div>
                  <div className="telemetry-panel-subtitle">Chronological Speed values from Speed Report overSpeedData</div>
                </div>
              </div>
              <div className="telemetry-chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={telemetry.data.speedTrend}>
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
                  <div className="telemetry-panel-subtitle">CumulativeDistance from Distance Report objTravelReport</div>
                </div>
              </div>
              <div className="telemetry-chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={telemetry.data.distanceTrend}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={52} />
                    <Tooltip content={<TooltipShell />} />
                    <Area type="monotone" dataKey="distanceKm" stroke="#0b8666" fill="rgba(11, 134, 102, 0.18)" name="Distance (km)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="telemetry-panel-grid">
            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Driving Behaviour Indicators</div>
                  <div className="telemetry-panel-subtitle">Colour-coded heuristics for movement quality and risk</div>
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

            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Speed Events Timeline</div>
                  <div className="telemetry-panel-subtitle">Recent high-signal speed events and driving activity timeline</div>
                </div>
              </div>
              <div className="telemetry-events-list">
                {telemetry.data.speedEvents.length ? (
                  telemetry.data.speedEvents.map((event) => (
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
                  <BarChart data={telemetry.data.activityTimeline}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={42} />
                    <Tooltip content={<TooltipShell />} />
                    <Bar dataKey="durationMinutes" radius={[6, 6, 0, 0]} name="Duration (min)">
                      {telemetry.data.activityTimeline.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={entry.tone === 'red' ? '#c92a2a' : entry.tone === 'yellow' ? '#d29b00' : '#0b8666'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="card telemetry-panel">
            <div className="telemetry-panel-head">
              <div>
                <div className="card-title">Ignition Trip Timeline</div>
                <div className="telemetry-panel-subtitle">Trips are now derived from ignition on/off sessions, with distance added from the distance report</div>
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
                  {telemetry.data.tripSegments.length ? (
                    telemetry.data.tripSegments.map((trip, index) => {
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
          </section>

          <section className="card telemetry-panel">
            <div className="telemetry-panel-head">
              <div>
                <div className="card-title">Overspeeding Instances</div>
                <div className="telemetry-panel-subtitle">
                  From OverSpeed Report overSpeedData; duration uses reported overSpeedDuration
                </div>
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
                  {telemetry.data.overspeedInstances.length ? (
                    telemetry.data.overspeedInstances.map((instance, index) => (
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
        </>
      ) : null}
    </div>
  );
}
