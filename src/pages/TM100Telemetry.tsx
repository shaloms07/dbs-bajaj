import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  fetchTelematicsVehicles,
  fetchVehicleStats,
  fetchVehicleTrips,
  TelematicsDevice,
  Trip,
  VehicleStatsResponse
} from '../services/tm100TelemetryService';

function formatKm(value: number | null) {
  if (value == null) return '0 km';
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds == null) return 'N/A';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
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
          <strong>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function TM100Telemetry() {
  const [vehicles, setVehicles] = useState<TelematicsDevice[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  
  const [stats, setStats] = useState<VehicleStatsResponse | null>(null);
  const [trips, setTrips] = useState<{ active_trip: Trip | null; recent_trips: Trip[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  const [rangePreset, setRangePreset] = useState<string>('last_30_days');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Initial Load: Fetch Vehicles
  useEffect(() => {
    async function loadVehicles() {
      try {
        const list = await fetchTelematicsVehicles();
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicle(list[0].vehicle_reg_no);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch vehicles list');
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  // Fetch Stats and Trips when vehicle or filter range changes
  useEffect(() => {
    if (!selectedVehicle) return;

    async function loadTelemetryData() {
      setLoading(true);
      setError(null);
      try {
        const statsPromise = fetchVehicleStats(
          selectedVehicle,
          isCustomRange ? undefined : rangePreset,
          isCustomRange ? fromDate : undefined,
          isCustomRange ? toDate : undefined
        );
        const tripsPromise = fetchVehicleTrips(selectedVehicle);

        const [statsData, tripsData] = await Promise.all([statsPromise, tripsPromise]);
        setStats(statsData);
        setTrips(tripsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load telemetry stats');
      } finally {
        setLoading(false);
      }
    }

    if (!isCustomRange || (fromDate && toDate)) {
      loadTelemetryData();
    }
  }, [selectedVehicle, isCustomRange, rangePreset, fromDate, toDate]);

  // Derived charts dataset
  const speedTrendData = useMemo(() => {
    if (!trips?.recent_trips || trips.recent_trips.length === 0) return [];
    return [...trips.recent_trips]
      .reverse()
      .map((t, idx) => ({
        label: t.started_at ? new Date(t.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : `Trip ${idx + 1}`,
        'Avg Speed': t.avg_speed_kmph ?? 0,
        'Max Speed': t.max_speed_kmph ?? 0
      }));
  }, [trips]);

  const distanceTrendData = useMemo(() => {
    if (!trips?.recent_trips || trips.recent_trips.length === 0) return [];
    return [...trips.recent_trips]
      .reverse()
      .map((t, idx) => ({
        label: t.started_at ? new Date(t.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : `Trip ${idx + 1}`,
        'Distance (km)': t.total_distance_km ?? 0
      }));
  }, [trips]);

  const dayNightMixData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Day Driving', value: stats.distance.day_km, color: '#0b8666' },
      { name: 'Night Driving', value: stats.distance.night_km, color: '#d29b00' }
    ];
  }, [stats]);

  const safetyMixData = useMemo(() => {
    if (!stats) return [];
    const items = [
      { name: 'Harsh Accel', value: stats.safety.harsh_acceleration, color: '#c92a2a' },
      { name: 'Harsh Braking', value: stats.safety.harsh_braking, color: '#d29b00' },
      { name: 'Harsh Turning', value: stats.safety.harsh_turning, color: '#005dac' },
      { name: 'Overspeeding', value: stats.safety.overspeeding_count, color: '#7c3aed' }
    ];
    return items.filter((item) => item.value > 0);
  }, [stats]);

  const insights = useMemo(() => {
    if (!stats) return [];
    const list: string[] = [];
    list.push(`Vehicle stats reflect ${stats.trips_included} completed trips covering a total of ${stats.distance.total_km.toFixed(1)} km.`);
    if (stats.distance.night_pct > 15) {
      list.push(`Night driving ratio is elevated at ${stats.distance.night_pct.toFixed(1)}%. Night driving increases risk exposure.`);
    } else {
      list.push(`Night driving ratio is within a low risk profile (${stats.distance.night_pct.toFixed(1)}%).`);
    }
    if (stats.safety.harsh_events_per_100km > 5) {
      list.push(`Harsh event density is high at ${stats.safety.harsh_events_per_100km.toFixed(1)} events per 100km. Driver coaching is recommended.`);
    } else {
      list.push(`Harsh event density is low (${stats.safety.harsh_events_per_100km.toFixed(1)}/100km), indicating safe, smooth driving behavior.`);
    }
    if (stats.safety.overspeeding_count > 0) {
      list.push(`Overspeeding was triggered ${stats.safety.overspeeding_count} times, with a peak speed of ${stats.speed.max_kmph.toFixed(1)} km/h.`);
    } else {
      list.push(`Excellent speed compliance: zero overspeeding alerts recorded.`);
    }
    return list;
  }, [stats]);

  const handlePresetChange = (preset: string) => {
    setIsCustomRange(false);
    setRangePreset(preset);
  };

  const handleCustomRangeSetup = () => {
    setIsCustomRange(true);
    if (!fromDate || !toDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="telemetry-page">
      <div className="api-hero">
        <div>
          <p className="api-eyebrow">Production Telematics</p>
          <h1>Vehicle Telemetry Dashboard</h1>
          <p className="api-lead">
            Aggregated metrics, driver behavior analysis, and historical trips sourced directly from vehicle GPS and OBD telemetry.
          </p>
        </div>
      </div>

      <div className="telemetry-filter-bar">
        <div className="telemetry-filter-grid">
          <label className="telemetry-filter-field">
            <span>Vehicle</span>
            <select value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)}>
              {vehicles.map((v) => (
                <option key={v.imei} value={v.vehicle_reg_no}>
                  {v.vehicle_reg_no}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 items-end">
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                !isCustomRange && rangePreset === 'today'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetChange('last_7_days')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                !isCustomRange && rangePreset === 'last_7_days'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handlePresetChange('last_30_days')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                !isCustomRange && rangePreset === 'last_30_days'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={handleCustomRangeSetup}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isCustomRange
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Custom Range
            </button>
          </div>

          {isCustomRange && (
            <div className="flex gap-2 items-end">
              <label className="telemetry-filter-field">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                />
              </label>
              <label className="telemetry-filter-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                />
              </label>
            </div>
          )}
        </div>

        <div className="telemetry-filter-actions">
          <div className="telemetry-filter-meta">
            <span>Analytics source</span>
            <strong>Connected OBD Telematics</strong>
            <small>Aggregated at the server-side analysis pipeline.</small>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500 font-medium">Fetching telemetry data...</span>
        </div>
      ) : stats ? (
        <>
          {/* Active Trip spotlight */}
          {trips?.active_trip && (
            <div className="card border-l-4 border-rose-500 bg-rose-50/20 p-4 mb-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
                    LIVE TRIP IN PROGRESS
                  </span>
                  <span className="font-semibold text-rose-900">Vehicle is currently on the road</span>
                </div>
                <span className="text-sm text-gray-600 mt-1">
                  Trip started at <strong>{formatDateTime(trips.active_trip.started_at)}</strong>
                </span>
              </div>
              <div className="text-sm text-gray-700 bg-white px-3 py-1.5 rounded border border-rose-100 shadow-sm">
                <strong>Start Coordinates:</strong> {formatCoordinate(trips.active_trip.start_lat, trips.active_trip.start_lon)}
              </div>
            </div>
          )}

          <section className="telemetry-kpi-grid">
            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Total Distance Driven</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{formatKm(stats.distance.total_km)}</div>
                <div className="telemetry-summary-average">{stats.trips_included} trips</div>
              </div>
              <div className="telemetry-summary-note">Overall distance driven in the selected range</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Day Driving</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{formatKm(stats.distance.day_km)}</div>
                <div className="telemetry-summary-average">
                  {(100 - stats.distance.night_pct).toFixed(1)}%
                </div>
              </div>
              <div className="telemetry-summary-note">Distance driven during daytime hours</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Night Driving</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{formatKm(stats.distance.night_km)}</div>
                <div className="telemetry-summary-average">
                  {stats.distance.night_pct.toFixed(1)}%
                </div>
              </div>
              <div className="telemetry-summary-note">Distance driven during nighttime (10 PM - 6 AM)</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Average Speed</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{stats.speed.avg_kmph.toFixed(1)} km/h</div>
                <div className="telemetry-summary-average">{formatDuration(stats.duration.total_seconds)}</div>
              </div>
              <div className="telemetry-summary-note">Overall average speed and total wheel duration</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Top Speed</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{stats.speed.max_kmph.toFixed(1)} km/h</div>
                <div className="telemetry-summary-average">{stats.safety.overspeeding_count} alerts</div>
              </div>
              <div className="telemetry-summary-note">Peak speed and counts exceeding limit thresholds</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Harsh Driving Events</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{stats.safety.total_harsh_events}</div>
                <div className="telemetry-summary-average">{stats.safety.harsh_events_per_100km.toFixed(1)} / 100km</div>
              </div>
              <div className="telemetry-summary-note">Total alerts and density per 100 km driven</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Longest Trip</div>
              <div className="telemetry-summary-value-row">
                <div className="telemetry-summary-value">{formatKm(stats.distance.longest_trip_km)}</div>
                <div className="telemetry-summary-average">{formatDuration(stats.duration.longest_trip_seconds)}</div>
              </div>
              <div className="telemetry-summary-note">Maximum distance logged in a single closed session</div>
            </div>

            <div className="card telemetry-kpi-card">
              <div className="telemetry-summary-label">Risk Profile Status</div>
              <div className="telemetry-summary-value-row">
                <div className={`telemetry-summary-value text-sm font-semibold inline-block px-3 py-1 rounded ${
                  stats.safety.harsh_events_per_100km > 8
                    ? 'bg-red-100 text-red-800'
                    : stats.safety.harsh_events_per_100km > 4
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {stats.safety.harsh_events_per_100km > 8 ? 'High Risk' : stats.safety.harsh_events_per_100km > 4 ? 'Moderate' : 'Low Risk'}
                </div>
                <div className="telemetry-summary-average">calculated</div>
              </div>
              <div className="telemetry-summary-note">Overall risk class assessment from telemetry</div>
            </div>
          </section>

          <section className="telemetry-insights-grid">
            {insights.map((insight, idx) => (
              <div key={idx} className="card telemetry-insight-card">
                <div className="telemetry-summary-label">Telemetry Insight</div>
                <p>{insight}</p>
              </div>
            ))}
          </section>

          <section className="telemetry-panel-grid">
            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Speed Trend (Per Trip)</div>
                  <div className="telemetry-panel-subtitle">Average and Maximum speeds across recent closed trips</div>
                </div>
              </div>
              <div className="telemetry-chart-wrap">
                {speedTrendData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={speedTrendData}>
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={42} />
                      <Tooltip content={<SimpleTooltip />} />
                      <Line type="monotone" dataKey="Avg Speed" stroke="#005dac" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Max Speed" stroke="#c92a2a" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="telemetry-empty-state py-16">No trip trend data available.</div>
                )}
              </div>
            </div>

            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Distance Trend (Per Trip)</div>
                  <div className="telemetry-panel-subtitle">Distance driven across recent closed trips</div>
                </div>
              </div>
              <div className="telemetry-chart-wrap">
                {distanceTrendData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distanceTrendData}>
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={42} />
                      <Tooltip content={<SimpleTooltip />} />
                      <Bar dataKey="Distance (km)" radius={[6, 6, 0, 0]} fill="#0b8666" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="telemetry-empty-state py-16">No trip trend data available.</div>
                )}
              </div>
            </div>
          </section>

          <section className="telemetry-panel-grid">
            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Day vs Night Split</div>
                  <div className="telemetry-panel-subtitle">Distance distribution based on daylight and night hours</div>
                </div>
              </div>
              <div className="telemetry-chart-two-up">
                <div className="telemetry-chart-wrap">
                  {stats.distance.total_km > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={dayNightMixData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                          {dayNightMixData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<SimpleTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="telemetry-empty-state py-16">No distance recorded.</div>
                  )}
                </div>
                <div className="telemetry-side-metrics">
                  {dayNightMixData.map((entry) => (
                    <div key={entry.name} className="telemetry-side-metric">
                      <span>{entry.name}</span>
                      <strong>{formatKm(entry.value)}</strong>
                      <small>
                        {stats.distance.total_km > 0
                          ? `${((entry.value / stats.distance.total_km) * 100).toFixed(1)}% of distance`
                          : '0% of distance'}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card telemetry-panel">
              <div className="telemetry-panel-head">
                <div>
                  <div className="card-title">Safety Events Breakdown</div>
                  <div className="telemetry-panel-subtitle">Distribution of logged alert and behavior violations</div>
                </div>
              </div>
              <div className="telemetry-chart-two-up">
                <div className="telemetry-chart-wrap">
                  {safetyMixData.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={safetyMixData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                          {safetyMixData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<SimpleTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="telemetry-empty-state py-16">No harsh behavior events recorded.</div>
                  )}
                </div>
                <div className="telemetry-side-metrics">
                  {safetyMixData.length ? (
                    safetyMixData.map((entry) => (
                      <div key={entry.name} className="telemetry-side-metric">
                        <span>{entry.name}</span>
                        <strong>{entry.value} events</strong>
                        <small>
                          {stats.safety.total_harsh_events > 0
                            ? `${((entry.value / stats.safety.total_harsh_events) * 100).toFixed(1)}% of total`
                            : '0%'}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 font-medium mt-4">Smooth driving! No alert logs.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="card telemetry-panel mb-8">
            <div className="telemetry-panel-head">
              <div>
                <div className="card-title">Recent Trips Timeline</div>
                <div className="telemetry-panel-subtitle">History of the last 10 closed driving sessions</div>
              </div>
            </div>
            <div className="telemetry-table-wrap">
              <table className="usage-billing-table telemetry-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Distance</th>
                    <th>Avg Speed</th>
                    <th>Max Speed</th>
                    <th>Start Coords</th>
                    <th>End Coords</th>
                  </tr>
                </thead>
                <tbody>
                  {trips?.recent_trips.length ? (
                    trips.recent_trips.map((trip) => (
                      <tr key={trip.id}>
                        <td className="font-mono text-xs max-w-[120px] truncate">{trip.id}</td>
                        <td>{formatDateTime(trip.started_at)}</td>
                        <td>{formatDateTime(trip.ended_at)}</td>
                        <td>{formatDuration(trip.total_duration_seconds)}</td>
                        <td>{formatKm(trip.total_distance_km)}</td>
                        <td>{trip.avg_speed_kmph != null ? `${trip.avg_speed_kmph.toFixed(1)} km/h` : 'N/A'}</td>
                        <td>{trip.max_speed_kmph != null ? `${trip.max_speed_kmph.toFixed(1)} km/h` : 'N/A'}</td>
                        <td className="font-mono text-xs">{formatCoordinate(trip.start_lat, trip.start_lon)}</td>
                        <td className="font-mono text-xs">{formatCoordinate(trip.end_lat, trip.end_lon)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9}>
                        <div className="telemetry-empty-state py-8">No closed trip records returned for this vehicle.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="card text-center py-20 text-gray-500 font-medium">
          No telemetry statistics returned for the selected vehicle.
        </div>
      )}
    </div>
  );
}
