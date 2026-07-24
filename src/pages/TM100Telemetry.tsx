import { useEffect, useState } from 'react';

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

function formatElapsed(startedAt: string | null): string {
  if (!startedAt) return 'N/A';
  const diffMs = Date.now() - new Date(startedAt).getTime();
  if (diffMs < 0) return 'N/A';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}




export default function TM100Telemetry() {
  const [vehicles, setVehicles] = useState<TelematicsDevice[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  
  const [stats, setStats] = useState<VehicleStatsResponse | null>(null);
  const [trips, setTrips] = useState<{ active_trip: Trip | null; recent_trips: Trip[] } | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [tripsLoading, setTripsLoading] = useState<boolean>(true);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Filter States
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  const [rangePreset, setRangePreset] = useState<string>('today');
  const [fromDateInput, setFromDateInput] = useState<string>('');
  const [toDateInput, setToDateInput] = useState<string>('');
  const [appliedFromDate, setAppliedFromDate] = useState<string>('');
  const [appliedToDate, setAppliedToDate] = useState<string>('');

  // Initial Load: Fetch Vehicles
  useEffect(() => {
    async function loadVehicles() {
      try {
        const list = await fetchTelematicsVehicles();
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicle(list[0].vehicle_reg_no);
        }
      } catch (err: any) {
        setVehiclesError(err.message || 'Failed to fetch vehicles list');
      } finally {
        setVehiclesLoading(false);
      }
    }
    loadVehicles();
  }, []);

  // Fetch Trips when selected vehicle changes
  useEffect(() => {
    if (!selectedVehicle) return;

    async function loadTrips() {
      setTripsLoading(true);
      setTripsError(null);
      try {
        const tripsData = await fetchVehicleTrips(selectedVehicle);
        setTrips(tripsData);
      } catch (err: any) {
        setTripsError(err.message || 'Failed to load telemetry trips');
      } finally {
        setTripsLoading(false);
      }
    }
    loadTrips();
  }, [selectedVehicle]);

  // Fetch Stats when vehicle or filter range changes
  useEffect(() => {
    if (!selectedVehicle) return;

    async function loadStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const statsData = await fetchVehicleStats(
          selectedVehicle,
          isCustomRange ? undefined : rangePreset,
          isCustomRange ? appliedFromDate : undefined,
          isCustomRange ? appliedToDate : undefined
        );
        setStats(statsData);
      } catch (err: any) {
        setStatsError(err.message || 'Failed to load telemetry stats');
      } finally {
        setStatsLoading(false);
      }
    }

    if (!isCustomRange || (appliedFromDate && appliedToDate)) {
      loadStats();
    } else {
      setStats(null);
      setStatsLoading(false);
    }
  }, [selectedVehicle, isCustomRange, rangePreset, appliedFromDate, appliedToDate]);



  const handlePresetChange = (preset: string) => {
    setIsCustomRange(false);
    setRangePreset(preset);
  };

  const handleCustomRangeSetup = () => {
    setIsCustomRange(true);
    setFromDateInput('');
    setToDateInput('');
    setAppliedFromDate('');
    setAppliedToDate('');
    setStats(null);
  };

  const handleApplyCustomRange = () => {
    if (!fromDateInput || !toDateInput) {
      alert('Please select both From and To dates.');
      return;
    }
    setAppliedFromDate(fromDateInput);
    setAppliedToDate(toDateInput);
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

      {vehiclesError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{vehiclesError}</p>
        </div>
      )}

      {vehiclesLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500 font-medium">Loading telemetry devices...</span>
        </div>
      ) : (
        <>
          {/* Global Vehicle Selector Header */}
          <div className="telemetry-page-header flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <span>Selected Vehicle:</span>
              <select 
                value={selectedVehicle} 
                onChange={(event) => setSelectedVehicle(event.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {vehicles.map((v) => (
                  <option key={v.imei} value={v.vehicle_reg_no}>
                    TEST VEHICLE
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Active Trip banner — always visible when a trip is in progress, regardless of stats */}
          {trips?.active_trip && (
            <div className="active-trip-banner">
              <div className="active-trip-pulse">
                <span className="active-trip-dot" />
                LIVE TRIP IN PROGRESS
              </div>
              <div className="active-trip-body">
                <div className="active-trip-row">
                  <span className="active-trip-label">Started</span>
                  <span className="active-trip-value">{formatDateTime(trips.active_trip.started_at)}</span>
                </div>
                <div className="active-trip-row">
                  <span className="active-trip-label">Elapsed</span>
                  <span className="active-trip-value">{formatElapsed(trips.active_trip.started_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Layout */}
          <div className="telemetry-content-layout flex flex-col gap-8">
            
            {/* Section 1: Performance Stats */}
            <div className="card p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-gray-200 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Driving Analytics</h2>
                  <p className="text-sm text-gray-500">Period-based driving metrics and safety performance</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-2">
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
                    <div className="flex gap-3 items-end bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <label className="telemetry-filter-field">
                        <span>From</span>
                        <input
                          type="date"
                          value={fromDateInput}
                          onChange={(e) => setFromDateInput(e.target.value)}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        />
                      </label>
                      <label className="telemetry-filter-field">
                        <span>To</span>
                        <input
                          type="date"
                          value={toDateInput}
                          onChange={(e) => setToDateInput(e.target.value)}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        />
                      </label>
                      <button
                        onClick={handleApplyCustomRange}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm h-[38px] flex items-center justify-center"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {statsError ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-sm text-red-700">{statsError}</p>
                </div>
              ) : isCustomRange && (!appliedFromDate || !appliedToDate) ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg text-gray-700 font-semibold mb-1">Select Custom Date Range</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Please choose a start date and an end date above, then click <strong>Apply</strong> to load the vehicle's telemetry analytics.
                  </p>
                </div>
              ) : statsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500 font-medium">Loading telemetry stats...</span>
                </div>
              ) : stats ? (
                <>
                  {/* Distance Group */}
                  <div className="telemetry-group-label">Distance</div>
                  <section className="telemetry-kpi-grid">
                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Total Distance</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{formatKm(stats.distance.total_km)}</div>
                        <div className="telemetry-summary-average">{stats.trips_included} trips</div>
                      </div>
                      <div className="telemetry-summary-note">
                        Avg {formatKm(stats.distance.avg_per_trip_km)} / trip · Longest {formatKm(stats.distance.longest_trip_km)}
                      </div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Day Driving</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{formatKm(stats.distance.day_km)}</div>
                        <div className="telemetry-summary-average">{formatDuration(stats.duration.day_seconds)}</div>
                      </div>
                      <div className="telemetry-summary-note">Distance and duration during daytime hours</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Night Driving</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{formatKm(stats.distance.night_km)}</div>
                        <div className="telemetry-summary-average">{formatDuration(stats.duration.night_seconds)}</div>
                      </div>
                      <div className="telemetry-summary-note">{stats.distance.night_pct.toFixed(1)}% of total distance</div>
                    </div>
                  </section>

                  {/* Speed Group */}
                  <div className="telemetry-group-label">Speed</div>
                  <section className="telemetry-kpi-grid">
                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Max Speed</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.speed.max_kmph.toFixed(1)} km/h</div>
                      </div>
                      <div className="telemetry-summary-note">Peak speed recorded in the selected period</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Average Speed</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.speed.avg_kmph.toFixed(1)} km/h</div>
                      </div>
                      <div className="telemetry-summary-note">Overall average across all completed trips</div>
                    </div>
                  </section>

                  {/* Harsh Events Group */}
                  <div className="telemetry-group-label">Harsh Events</div>
                  <section className="telemetry-kpi-grid">
                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Harsh Accelerations</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.safety.harsh_acceleration}</div>
                        <div className="telemetry-summary-average">events</div>
                      </div>
                      <div className="telemetry-summary-note">Sudden vehicle speed increases logged</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Harsh Brakings</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.safety.harsh_braking}</div>
                        <div className="telemetry-summary-average">events</div>
                      </div>
                      <div className="telemetry-summary-note">Sudden hard braking triggers logged</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Harsh Turnings</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.safety.harsh_turning}</div>
                        <div className="telemetry-summary-average">events</div>
                      </div>
                      <div className="telemetry-summary-note">Aggressive cornering / lateral force events</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Overspeeding Events</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.safety.overspeeding_count}</div>
                        <div className="telemetry-summary-average">events</div>
                      </div>
                      <div className="telemetry-summary-note">Counts exceeding speed limit thresholds</div>
                    </div>

                    <div className="card telemetry-kpi-card bg-gray-50">
                      <div className="telemetry-summary-label">Total Harsh Events</div>
                      <div className="telemetry-summary-value-row">
                        <div className="telemetry-summary-value">{stats.safety.total_harsh_events}</div>
                        <div className="telemetry-summary-average">{stats.safety.harsh_events_per_100km.toFixed(1)} / 100km</div>
                      </div>
                      <div className="telemetry-summary-note">Aggregate violations and event density</div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500 font-medium">
                  No telemetry statistics returned for the selected vehicle.
                </div>
              )}
            </div>

            {/* Section 2: Recent Trips Timeline */}
            <div className="card p-6 mb-8">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Trips Timeline</h2>
                <p className="text-sm text-gray-500">History of the last 10 closed driving sessions</p>
              </div>

              {tripsError ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-sm text-red-700">{tripsError}</p>
                </div>
              ) : tripsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500 font-medium">Loading recent trips...</span>
                </div>
              ) : (
                <div className="telemetry-table-wrap">
                  <table className="usage-billing-table telemetry-table">
                    <thead>
                      <tr>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Duration</th>
                        <th>Distance</th>
                        <th>Avg Speed</th>
                        <th>Max Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips?.recent_trips.length ? (
                        trips.recent_trips.map((trip) => (
                          <tr key={trip.id}>
                            <td>{formatDateTime(trip.started_at)}</td>
                            <td>{formatDateTime(trip.ended_at)}</td>
                            <td>{formatDuration(trip.total_duration_seconds)}</td>
                            <td>{formatKm(trip.total_distance_km)}</td>
                            <td>{trip.avg_speed_kmph != null ? `${trip.avg_speed_kmph.toFixed(1)} km/h` : 'N/A'}</td>
                            <td>{trip.max_speed_kmph != null ? `${trip.max_speed_kmph.toFixed(1)} km/h` : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6}>
                            <div className="telemetry-empty-state py-8">No closed trip records returned for this vehicle.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
