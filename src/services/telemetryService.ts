const DEFAULT_TRACKMASTER_API_BASE_URL = 'https://api1.trackmaster.in/api';
const trackmasterApiBaseUrl = (import.meta.env.VITE_TRACKMASTER_API_BASE_URL || DEFAULT_TRACKMASTER_API_BASE_URL).replace(/\/+$/, '');
const trackmasterCustomerId = import.meta.env.VITE_TRACKMASTER_CUSTOMER_ID || '135482';

export interface TelemetryVehicleOption {
  label: string;
  vehicleNumber: string;
  bbid: string;
  customerId: string;
}

export interface TelemetryFilter {
  vehicleNumber: string;
  bbid: string;
  customerId: string;
  startDateTime: string;
  endDateTime: string;
}

export interface TelemetrySpeedLog {
  id: string;
  timestamp: string | null;
  speed: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  overspeed: boolean;
  raw: Record<string, unknown>;
}

export interface TelemetryTripSegment {
  id: string;
  startTime: string | null;
  endTime: string | null;
  startLocation: string;
  endLocation: string;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
  distanceKm: number;
  cumulativeDistanceKm: number;
  durationMinutes: number;
  raw: Record<string, unknown>;
}

interface IgnitionSession {
  id: string;
  startTime: string | null;
  endTime: string | null;
  startLocation: string;
  endLocation: string;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
  durationMinutes: number;
  raw: Record<string, unknown>;
}

export interface TelemetryBehaviorIndicator {
  label: string;
  tone: 'green' | 'yellow' | 'red';
  description: string;
}

export interface OverspeedInstance {
  id: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  peakSpeed: number;
  startLocation: string;
  endLocation: string;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
}

export interface IdlingSession {
  id: string;
  startTime: string | null;
  endTime: string | null;
  durationSeconds: number;
  startLocation: string;
  endLocation: string;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
}

export interface VehicleTelemetryData {
  vehicleNumber: string;
  bbid: string;
  totalDistanceKm: number;
  totalDrivingDurationMinutes: number;
  maxSpeed: number;
  overspeedCount: number;
  overspeedDurationMinutes: number;
  dayDrivingMinutes: number;
  nightDrivingMinutes: number;
  dayDrivingKm: number;
  nightDrivingKm: number;
  dayDrivingPct: number;
  nightDrivingPct: number;
  urbanDrivingPct: number;
  ruralDrivingPct: number;
  hillyDrivingPct: number;
  urbanDrivingKm: number;
  ruralDrivingKm: number;
  hillyDrivingKm: number;
  totalTrips: number;
  cumulativeDistanceKm: number;
  speedTrend: Array<{ label: string; speed: number }>;
  distanceTrend: Array<{ label: string; distanceKm: number }>;
  activityTimeline: Array<{ label: string; durationMinutes: number; tone: 'green' | 'yellow' | 'red' }>;
  speedEventTimeline: Array<{
    label: string;
    eventCount: number;
    peakSpeed: number;
    totalDurationMinutes: number;
    sessionCount: number;
    tone: 'green' | 'yellow' | 'red';
  }>;
  speedEvents: Array<{ label: string; tone: 'green' | 'yellow' | 'red'; details: string }>;
  speedLogs: TelemetrySpeedLog[];
  overspeedInstances: OverspeedInstance[];
  overspeedSeverity: 'normal' | 'moderate' | 'high_risk';
  totalIdlingMinutes: number;
  totalIdlingSeconds: number;
  ignitionCycles: number;
  longestIdleSessionSeconds: number;
  averageIdleSessionSeconds: number;
  idleSessionCount: number;
  idlingRiskScore: number;
  idlingSeverity: 'normal' | 'warning' | 'critical';
  idlingSessions: IdlingSession[];
  insights: string[];
  tripSegments: TelemetryTripSegment[];
  behaviorIndicators: TelemetryBehaviorIndicator[];
  overspeedLimit: number;
}

type DataTableResponse = {
  aaData?: unknown[];
  data?: unknown[];
  rows?: unknown[];
  Data?: unknown[];
  result?: unknown[];
  [key: string]: unknown;
};

type SpeedSummaryRow = {
  vehname?: string;
  overspeedCount?: number | string;
  overspeedLimit?: number | string;
  maxSpeed?: number | string;
  overSpeedDuration?: string;
  bbid?: string;
  overSpeedData?: unknown[];
  OverCustomCount?: number | string;
  [key: string]: unknown;
};

type DistanceSummaryRow = {
  VehicleName?: string;
  TotalDistance?: number | string;
  TotalDuration?: string;
  bbid?: string;
  dataCount?: number | string;
  objTravelReport?: unknown[];
  [key: string]: unknown;
};

type IgnitionSummaryRow = {
  VehicleName?: string;
  DriverName?: string;
  IgnitionOnOffCounter?: number | string;
  TotalIgnitionTime?: string;
  bbid?: string;
  objIgnitionStatusReport?: unknown[];
  [key: string]: unknown;
};

type IdlingSummaryRow = {
  VehicleName?: string;
  IgnitionOnOffCounter?: number | string;
  TotalIdlingHours?: string;
  objTravelReport?: unknown[];
  [key: string]: unknown;
};

const TELEMETRY_VEHICLES: TelemetryVehicleOption[] = [
  {
    label: 'TEST_VEHICLE',
    vehicleNumber: 'TEST_VEHICLE',
    bbid: 'J865510083289001',
    customerId: '135482'
  },
  {
    label: 'TEST_VEHICLE 135478',
    vehicleNumber: 'TEST_VEHICLE_135478',
    bbid: 'I868329080777299',
    customerId: '135478'
  },
  {
    label: 'TEST_VEHICLE 135479',
    vehicleNumber: 'TEST_VEHICLE_135479',
    bbid: 'I868329087183558',
    customerId: '135479'
  },
];


function formatTrackmasterDate(dateValue: string) {
  const normalizedValue = dateValue.length === 10 ? `${dateValue}T00:00:00` : dateValue;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid telemetry date range');
  }

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const meridiem = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${month} ${day} ${year} ${hours}:${minutes}:${seconds} ${meridiem}`;
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toNullableNumber(value: unknown) {
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const numericDate = new Date(value);
    return Number.isNaN(numericDate.getTime()) ? null : numericDate;
  }
  if (typeof value === 'string' && value.trim()) {
    const raw = value.trim().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
    const nativeParsed = new Date(raw);
    if (!Number.isNaN(nativeParsed.getTime())) return nativeParsed;

    const monthFormatMatch = raw.match(/^(\d{1,2})\/([A-Za-z]{3})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (monthFormatMatch) {
      const [, day, monthText, year, hourText, minuteText, secondText, meridiem] = monthFormatMatch;
      const monthMap: Record<string, number> = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11
      };
      const month = monthMap[monthText.toLowerCase()];
      if (month != null) {
        let hour = Number(hourText);
        if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
        return new Date(Number(year), month, Number(day), hour, Number(minuteText), Number(secondText));
      }
    }

    const slashFormatMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (slashFormatMatch) {
      const [, month, day, year, hourText, minuteText, secondText, meridiem] = slashFormatMatch;
      let hour = Number(hourText);
      if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return new Date(Number(year), Number(month) - 1, Number(day), hour, Number(minuteText), Number(secondText));
    }
  }
  return null;
}

function parseDurationToMinutes(value: unknown) {
  const totalSeconds = parseDurationToSeconds(value);
  return Math.round(totalSeconds / 60);
}

function parseDurationToSeconds(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;

  const raw = value.trim();
  if (!raw) return 0;

  const dayHourMinuteSecondMatch = raw.match(
    /(?:(\d+)\s*day\(s\))?[\s-]*(?:(\d+)\s*hour\(s\))?[:\s-]*(?:(\d+)\s*minute\(s\))?[:\s-]*(?:(\d+)\s*second\(s\))?/i
  );
  if (dayHourMinuteSecondMatch) {
    const days = Number(dayHourMinuteSecondMatch[1] || 0);
    const hours = Number(dayHourMinuteSecondMatch[2] || 0);
    const minutes = Number(dayHourMinuteSecondMatch[3] || 0);
    const seconds = Number(dayHourMinuteSecondMatch[4] || 0);
    if (days || hours || minutes || seconds) {
      return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
    }
  }

  const verboseMatch = raw.match(/(?:(\d+)\s*Hour\(s\))?\s*(?:(\d+)\s*Minute\(s\))?\s*(?:(\d+)\s*Second\(s\))?/i);
  if (verboseMatch) {
    const hours = Number(verboseMatch[1] || 0);
    const minutes = Number(verboseMatch[2] || 0);
    const seconds = Number(verboseMatch[3] || 0);
    if (hours || minutes || seconds) return hours * 60 * 60 + minutes * 60 + seconds;
  }

  const hhmmssMatch = raw.match(/^(\d{2})-(\d{2}):(\d{2}):(\d{2})$/);
  if (hhmmssMatch) {
    const [, days, hours, minutes, seconds] = hhmmssMatch;
    return Number(days) * 24 * 60 * 60 + Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  }

  const timeMatch = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (timeMatch) {
    const [, hours, minutes, seconds] = timeMatch;
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  }

  return 0;
}

function findValueByPatterns(source: Record<string, unknown>, patterns: string[]) {
  const entries = Object.entries(source);
  for (const [key, value] of entries) {
    const normalized = normalizeKey(key);
    if (patterns.some((pattern) => normalized.includes(pattern))) {
      return value;
    }
  }
  return undefined;
}

function parseLocationValue(value: unknown) {
  const raw = typeof value === 'string' ? value : '';
  const stripped = stripHtml(raw);
  const trackmasterMapMatch = raw.match(
    /showMapWindow(?:WithData)?\(\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'(-?\d{1,2}(?:\.\d+)?)'\s*,\s*'(-?\d{1,3}(?:\.\d+)?)'/i
  );
  const coordMatch =
    trackmasterMapMatch ||
    raw.match(/(-?\d{1,2}\.\d+)\s*[,/ ]\s*(-?\d{1,3}\.\d+)/) ||
    raw.match(/lat(?:itude)?['":= ]+(-?\d{1,2}\.\d+).*?lon(?:gitude)?['":= ]+(-?\d{1,3}\.\d+)/i) ||
    raw.match(new RegExp(`(${escapeRegex('ShowLocation')})\\(([-\\d.]+),\\s*([-\\d.]+)`));

  if (coordMatch) {
    const latIndex = coordMatch.length === 4 ? 2 : 1;
    const lngIndex = coordMatch.length === 4 ? 3 : 2;
    return {
      location: stripped || 'Unknown location',
      latitude: toNullableNumber(coordMatch[latIndex]),
      longitude: toNullableNumber(coordMatch[lngIndex])
    };
  }

  return {
    location: stripped || 'Unknown location',
    latitude: null,
    longitude: null
  };
}

function splitDayNightMinutes(startDate: Date, endDate: Date) {
  let dayMinutes = 0;
  let nightMinutes = 0;
  const cursor = new Date(startDate);

  while (cursor < endDate) {
    const next = new Date(cursor);
    next.setMinutes(next.getMinutes() + 15);
    const segmentEnd = next < endDate ? next : endDate;
    const minutes = Math.max((segmentEnd.getTime() - cursor.getTime()) / 60000, 0);
    const hour = cursor.getHours();

    if (hour >= 6 && hour < 22) {
      dayMinutes += minutes;
    } else {
      nightMinutes += minutes;
    }

    cursor.setTime(segmentEnd.getTime());
  }

  return { dayMinutes, nightMinutes };
}

function normalizeRow(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function pickTimestamp(row: Record<string, unknown>) {
  return findValueByPatterns(row, ['datetime', 'gpsdatetime', 'timestamp', 'eventtime', 'tripstart', 'starttime', 'date']);
}

function buildTelemetryUrl(path: string, params: URLSearchParams) {
  return `${trackmasterApiBaseUrl}${path}?${params.toString()}`;
}

async function fetchTrackmasterResponse(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*'
    },
    credentials: 'include'
  });

  const text = await response.text();
  let data: DataTableResponse | null = null;

  try {
    data = text ? (JSON.parse(text) as DataTableResponse) : null;
  } catch {
    throw new Error('Telemetry API returned a non-JSON response');
  }

  if (!response.ok) {
    throw new Error(`Telemetry API failed with status ${response.status}`);
  }

  return data;
}

async function fetchSpeedReport(filter: TelemetryFilter) {
  const params = new URLSearchParams({
    sEcho: '1',
    iColumns: '4',
    sColumns: ',,,',
    iDisplayStart: '0',
    iDisplayLength: '200',
    mDataProp_0: 'vehname',
    sSearch_0: '',
    bRegex_0: 'false',
    bSearchable_0: 'true',
    bSortable_0: 'true',
    mDataProp_1: 'driverName',
    sSearch_1: '',
    bRegex_1: 'false',
    bSearchable_1: 'true',
    bSortable_1: 'true',
    mDataProp_2: '',
    sSearch_2: '',
    bRegex_2: 'false',
    bSearchable_2: 'true',
    bSortable_2: 'false',
    mDataProp_3: 'bbid',
    sSearch_3: '',
    bRegex_3: 'false',
    bSearchable_3: 'true',
    bSortable_3: 'true',
    sSearch: '',
    bRegex: 'false',
    iSortCol_0: '0',
    sSortDir_0: 'asc',
    iSortingCols: '1',
    beginDate: formatTrackmasterDate(filter.startDateTime),
    endDate: formatTrackmasterDate(filter.endDateTime),
    bbid: filter.bbid,
    mode: 'normal',
    custid: filter.customerId || trackmasterCustomerId,
    downloadType: '',
    reportName: '',
    type: '0',
    _: String(Date.now())
  });

  return fetchTrackmasterResponse(buildTelemetryUrl('/Reportsapi/GetSpeedReportNew', params));
}

async function fetchOverSpeedReport(filter: TelemetryFilter) {
  const params = new URLSearchParams({
    sEcho: '1',
    iColumns: '8',
    sColumns: ',,,,,,,',
    iDisplayStart: '0',
    iDisplayLength: '200',
    mDataProp_0: 'vehname',
    sSearch_0: '',
    bRegex_0: 'false',
    bSearchable_0: 'true',
    bSortable_0: 'true',
    mDataProp_1: 'driverName',
    sSearch_1: '',
    bRegex_1: 'false',
    bSearchable_1: 'true',
    bSortable_1: 'true',
    mDataProp_2: 'overspeedCount',
    sSearch_2: '',
    bRegex_2: 'false',
    bSearchable_2: 'true',
    bSortable_2: 'true',
    mDataProp_3: 'overspeedLimit',
    sSearch_3: '',
    bRegex_3: 'false',
    bSearchable_3: 'true',
    bSortable_3: 'true',
    mDataProp_4: '',
    sSearch_4: '',
    bRegex_4: 'false',
    bSearchable_4: 'true',
    bSortable_4: 'false',
    mDataProp_5: 'overSpeedDuration',
    sSearch_5: '',
    bRegex_5: 'false',
    bSearchable_5: 'true',
    bSortable_5: 'true',
    mDataProp_6: '',
    sSearch_6: '',
    bRegex_6: 'false',
    bSearchable_6: 'true',
    bSortable_6: 'false',
    mDataProp_7: 'bbid',
    sSearch_7: '',
    bRegex_7: 'false',
    bSearchable_7: 'true',
    bSortable_7: 'true',
    sSearch: '',
    bRegex: 'false',
    iSortCol_0: '0',
    sSortDir_0: 'asc',
    iSortingCols: '1',
    beginDate: formatTrackmasterDate(filter.startDateTime),
    endDate: formatTrackmasterDate(filter.endDateTime),
    bbid: filter.bbid,
    mode: 'over',
    custid: filter.customerId || trackmasterCustomerId,
    downloadType: '',
    reportName: '',
    type: '0',
    _: String(Date.now())
  });

  return fetchTrackmasterResponse(buildTelemetryUrl('/Reportsapi/GetOverSpeedReport', params));
}

async function fetchDistanceReport(filter: TelemetryFilter) {
  const params = new URLSearchParams({
    sEcho: '1',
    iColumns: '3',
    sColumns: ',,',
    iDisplayStart: '0',
    iDisplayLength: '100',
    mDataProp_0: 'VehicleName',
    sSearch_0: '',
    bRegex_0: 'false',
    bSearchable_0: 'true',
    bSortable_0: 'true',
    mDataProp_1: 'TotalDistance',
    sSearch_1: '',
    bRegex_1: 'false',
    bSearchable_1: 'true',
    bSortable_1: 'true',
    mDataProp_2: '',
    sSearch_2: '',
    bRegex_2: 'false',
    bSearchable_2: 'true',
    bSortable_2: 'false',
    sSearch: '',
    bRegex: 'false',
    iSortCol_0: '0',
    sSortDir_0: 'asc',
    iSortingCols: '1',
    beginDate: formatTrackmasterDate(filter.startDateTime),
    endDate: formatTrackmasterDate(filter.endDateTime),
    bbid: filter.bbid,
    custid: filter.customerId || trackmasterCustomerId,
    downloadType: '',
    reportName: 'Distance Report',
    type: '0',
    mode: 'normal',
    _: String(Date.now())
  });

  return fetchTrackmasterResponse(buildTelemetryUrl('/AddOnAPI/DistanceReport', params));
}

async function fetchIgnitionReport(filter: TelemetryFilter) {
  const params = new URLSearchParams({
    sEcho: '1',
    iColumns: '6',
    sColumns: ',,,,,',
    iDisplayStart: '0',
    iDisplayLength: '100',
    mDataProp_0: 'bbid',
    sSearch_0: '',
    bRegex_0: 'false',
    bSearchable_0: 'true',
    bSortable_0: 'true',
    mDataProp_1: 'VehicleName',
    sSearch_1: '',
    bRegex_1: 'false',
    bSearchable_1: 'true',
    bSortable_1: 'true',
    mDataProp_2: 'DriverName',
    sSearch_2: '',
    bRegex_2: 'false',
    bSearchable_2: 'true',
    bSortable_2: 'true',
    mDataProp_3: 'IgnitionOnOffCounter',
    sSearch_3: '',
    bRegex_3: 'false',
    bSearchable_3: 'true',
    bSortable_3: 'true',
    mDataProp_4: 'TotalIgnitionTime',
    sSearch_4: '',
    bRegex_4: 'false',
    bSearchable_4: 'true',
    bSortable_4: 'true',
    mDataProp_5: '',
    sSearch_5: '',
    bRegex_5: 'false',
    bSearchable_5: 'true',
    bSortable_5: 'false',
    sSearch: '',
    bRegex: 'false',
    iSortCol_0: '0',
    sSortDir_0: 'asc',
    iSortingCols: '1',
    bbid: filter.bbid,
    beginDate: formatTrackmasterDate(filter.startDateTime),
    endDate: formatTrackmasterDate(filter.endDateTime),
    CustId: filter.customerId || trackmasterCustomerId,
    downloadType: '',
    reportName: '',
    _: String(Date.now())
  });

  return fetchTrackmasterResponse(buildTelemetryUrl('/ReportsApi/GetConsolidatedIgnitionStatus', params));
}

async function fetchIdlingReport(filter: TelemetryFilter) {
  const params = new URLSearchParams({
    sEcho: '1',
    iColumns: '6',
    sColumns: ',,,,,',
    iDisplayStart: '0',
    iDisplayLength: '20',
    mDataProp_0: 'bbid',
    sSearch_0: '',
    bRegex_0: 'false',
    bSearchable_0: 'true',
    bSortable_0: 'true',
    mDataProp_1: 'VehicleName',
    sSearch_1: '',
    bRegex_1: 'false',
    bSearchable_1: 'true',
    bSortable_1: 'true',
    mDataProp_2: 'DriverName',
    sSearch_2: '',
    bRegex_2: 'false',
    bSearchable_2: 'true',
    bSortable_2: 'true',
    mDataProp_3: 'IgnitionOnOffCounter',
    sSearch_3: '',
    bRegex_3: 'false',
    bSearchable_3: 'true',
    bSortable_3: 'true',
    mDataProp_4: 'TotalIdlingHours',
    sSearch_4: '',
    bRegex_4: 'false',
    bSearchable_4: 'true',
    bSortable_4: 'true',
    mDataProp_5: '',
    sSearch_5: '',
    bRegex_5: 'false',
    bSearchable_5: 'true',
    bSortable_5: 'false',
    sSearch: '',
    bRegex: 'false',
    iSortCol_0: '0',
    sSortDir_0: 'asc',
    iSortingCols: '1',
    bbid: filter.bbid,
    beginDate: formatTrackmasterDate(filter.startDateTime),
    endDate: formatTrackmasterDate(filter.endDateTime),
    CustId: filter.customerId || trackmasterCustomerId,
    downloadType: '',
    reportName: '',
    interval: '0-0',
    _: String(Date.now())
  });

  return fetchTrackmasterResponse(buildTelemetryUrl('/ReportsApi/GetIdlingStatusReport', params));
}

function buildSpeedLogs(rows: unknown[], overspeedLimit: number) {
  return rows
    .map((row, index) => {
      const item = normalizeRow(row);
      const timestamp = parseDateValue(item.DateTime ?? pickTimestamp(item));
      const speed = toNumber(item.Speed ?? findValueByPatterns(item, ['speed', 'currentspeed', 'vehiclespeed']));
      const parsedLocation = parseLocationValue(item.Location ?? findValueByPatterns(item, ['locationhtml', 'location', 'place', 'address', 'loc']));

      return {
        id: `${timestamp?.toISOString() ?? 'speed'}-${index}`,
        timestamp: timestamp?.toISOString() ?? null,
        speed,
        location: parsedLocation.location,
        latitude: parsedLocation.latitude,
        longitude: parsedLocation.longitude,
        overspeed: speed >= overspeedLimit,
        raw: item
      } satisfies TelemetrySpeedLog;
    })
    .filter((item) => item.timestamp || item.speed > 0)
    .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
}

function buildTripSegments(rows: unknown[]) {
  return rows
    .map((row, index) => {
      const item = normalizeRow(row);
      const startTime = parseDateValue(item.StartDateTime ?? findValueByPatterns(item, ['starttime', 'tripstart', 'journeystart', 'fromdate', 'begin']));
      const endTime = parseDateValue(item.EndDateTime ?? findValueByPatterns(item, ['endtime', 'tripend', 'journeyend', 'todate', 'end']));
      const startLocation = parseLocationValue(item.StartLocation ?? findValueByPatterns(item, ['startlocation', 'fromlocation', 'startplace', 'origin']));
      const endLocation = parseLocationValue(item.EndLocation ?? findValueByPatterns(item, ['endlocation', 'tolocation', 'endplace', 'destination']));
      const distanceKm = toNumber(item.DistanceTravelled ?? findValueByPatterns(item, ['totaldistance', 'distancekm', 'distance', 'tripdistance']));
      const cumulativeDistanceKm = toNumber(item.CumulativeDistance, distanceKm);
      const explicitDuration = parseDurationToMinutes(item.Duration ?? findValueByPatterns(item, ['durationminutes', 'duration', 'tripduration', 'drivingduration', 'timetaken']));
      const derivedDuration =
        startTime && endTime ? Math.max((endTime.getTime() - startTime.getTime()) / 60000, 0) : 0;
      const durationMinutes = explicitDuration || derivedDuration;

      return {
        id: `${startTime?.toISOString() ?? 'trip'}-${index}`,
        startTime: startTime?.toISOString() ?? null,
        endTime: endTime?.toISOString() ?? null,
        startLocation: startLocation.location,
        endLocation: endLocation.location,
        startLatitude: toNullableNumber(item.StartLatitude) ?? startLocation.latitude,
        startLongitude: toNullableNumber(item.StartLongitude) ?? startLocation.longitude,
        endLatitude: toNullableNumber(item.EndLatitude) ?? endLocation.latitude,
        endLongitude: toNullableNumber(item.EndLongitude) ?? endLocation.longitude,
        distanceKm,
        cumulativeDistanceKm,
        durationMinutes,
        raw: item
      } satisfies TelemetryTripSegment;
    })
    .filter((item) => item.distanceKm > 0 || item.durationMinutes > 0 || item.startTime || item.endTime)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function buildIgnitionSessions(rows: unknown[]) {
  return rows
    .map((row, index) => {
      const item = normalizeRow(row);
      const startTime = parseDateValue(item.IgnitionOnTime ?? item.StartDateTime);
      const endTime = parseDateValue(item.IgnitionOffTime ?? item.EndDateTime);
      const startLocation = parseLocationValue(item.SLocation ?? item.StartLocation);
      const endLocation = parseLocationValue(item.ELocation ?? item.EndLocation);
      const durationMinutes =
        parseDurationToMinutes(item.Duration) ||
        (startTime && endTime ? Math.max((endTime.getTime() - startTime.getTime()) / 60000, 0) : 0);

      return {
        id: `${startTime?.toISOString() ?? 'ignition'}-${index}`,
        startTime: startTime?.toISOString() ?? null,
        endTime: endTime?.toISOString() ?? null,
        startLocation: startLocation.location,
        endLocation: endLocation.location,
        startLatitude: startLocation.latitude,
        startLongitude: startLocation.longitude,
        endLatitude: endLocation.latitude,
        endLongitude: endLocation.longitude,
        durationMinutes,
        raw: item
      } satisfies IgnitionSession;
    })
    .filter((item) => item.startTime || item.endTime)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function buildIdlingSessions(rows: unknown[]) {
  return rows
    .map((row, index) => {
      const item = normalizeRow(row);
      const startTime = parseDateValue(item.StartDateTime ?? item.IgnitionOnTime ?? findValueByPatterns(item, ['starttime', 'fromdate', 'ignitionon']));
      const endTime = parseDateValue(item.EndDateTime ?? item.IgnitionOffTime ?? findValueByPatterns(item, ['endtime', 'todate', 'ignitionoff']));
      const sharedLocation = parseLocationValue(item.Location ?? findValueByPatterns(item, ['location', 'place', 'address', 'loc']));
      const startLocation = parseLocationValue(item.StartLocation ?? item.SLocation ?? item.Location ?? findValueByPatterns(item, ['startlocation', 'fromlocation', 'origin']));
      const endLocation = parseLocationValue(item.EndLocation ?? item.ELocation ?? item.Location ?? findValueByPatterns(item, ['endlocation', 'tolocation', 'destination']));
      const durationSeconds =
        parseDurationToSeconds(item.Duration ?? item.TotalIdlingHours ?? findValueByPatterns(item, ['duration', 'idlinghours', 'idletime'])) ||
        (startTime && endTime ? Math.max((endTime.getTime() - startTime.getTime()) / 1000, 0) : 0);

      return {
        id: `${startTime?.toISOString() ?? 'idle'}-${index}`,
        startTime: startTime?.toISOString() ?? null,
        endTime: endTime?.toISOString() ?? null,
        durationSeconds,
        startLocation: startLocation.location,
        endLocation: endLocation.location,
        startLatitude: startLocation.latitude ?? sharedLocation.latitude,
        startLongitude: startLocation.longitude ?? sharedLocation.longitude,
        endLatitude: endLocation.latitude ?? sharedLocation.latitude,
        endLongitude: endLocation.longitude ?? sharedLocation.longitude
      } satisfies IdlingSession;
    })
    .filter((item) => item.durationSeconds > 0 || item.startTime || item.endTime)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function sessionsOverlapTrip(session: IgnitionSession, trip: TelemetryTripSegment) {
  if (!session.startTime || !session.endTime || !trip.startTime || !trip.endTime) return false;
  const sessionStart = new Date(session.startTime).getTime();
  const sessionEnd = new Date(session.endTime).getTime();
  const tripStart = new Date(trip.startTime).getTime();
  const tripEnd = new Date(trip.endTime).getTime();

  return tripEnd >= sessionStart && tripStart <= sessionEnd;
}

function buildTripsFromIgnitionSessions(sessions: IgnitionSession[], distanceTrips: TelemetryTripSegment[]) {
  return sessions.map((session) => {
    const matchingTrips = distanceTrips.filter((trip) => sessionsOverlapTrip(session, trip));
    const distanceKm = Number(matchingTrips.reduce((sum, trip) => sum + trip.distanceKm, 0).toFixed(2));

    return {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      startLocation: session.startLocation,
      endLocation: session.endLocation,
      startLatitude: session.startLatitude,
      startLongitude: session.startLongitude,
      endLatitude: session.endLatitude,
      endLongitude: session.endLongitude,
      distanceKm,
      cumulativeDistanceKm: distanceKm,
      durationMinutes: session.durationMinutes,
      raw: session.raw
    } satisfies TelemetryTripSegment;
  });
}

function getRangeDays(filter: TelemetryFilter) {
  const start = new Date(filter.startDateTime);
  const end = new Date(filter.endDateTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diffMs = Math.max(end.getTime() - start.getTime(), 0);
  return diffMs / (24 * 60 * 60 * 1000);
}

function formatTrendDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata'
  });
}

function formatTrendTime(dateValue: string) {
  return new Date(dateValue).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
}

function buildDistanceTrend(trips: TelemetryTripSegment[], aggregateByDay: boolean) {
  if (aggregateByDay) {
    const grouped = new Map<string, number>();

    trips.forEach((trip) => {
      const key = trip.startTime ? new Date(trip.startTime).toISOString().slice(0, 10) : `Trip ${grouped.size + 1}`;
      grouped.set(key, Number(((grouped.get(key) ?? 0) + trip.distanceKm).toFixed(2)));
    });

    return Array.from(grouped.entries()).map(([dayKey, dayDistanceKm]) => ({
      label: dayKey.includes('-') ? formatTrendDate(`${dayKey}T00:00:00`) : dayKey,
      distanceKm: Number(dayDistanceKm.toFixed(2))
    }));
  }

  let cumulativeDistanceKm = 0;

  return trips.map((trip, index) => {
    cumulativeDistanceKm += trip.distanceKm;
    const distanceKm = trip.cumulativeDistanceKm || Number(cumulativeDistanceKm.toFixed(2));
    return {
      label: trip.startTime
        ? formatTrendTime(trip.startTime)
        : `Trip ${index + 1}`,
      distanceKm: Number(distanceKm.toFixed(2))
    };
  });
}

function buildSpeedTrend(logs: TelemetrySpeedLog[], aggregateByDay: boolean) {
  if (aggregateByDay) {
    const grouped = new Map<string, { totalSpeed: number; count: number }>();

    logs.forEach((log) => {
      const key = log.timestamp ? new Date(log.timestamp).toISOString().slice(0, 10) : `Log ${grouped.size + 1}`;
      const current = grouped.get(key) ?? { totalSpeed: 0, count: 0 };
      current.totalSpeed += log.speed;
      current.count += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries()).map(([dayKey, value]) => ({
      label: dayKey.includes('-') ? formatTrendDate(`${dayKey}T00:00:00`) : dayKey,
      speed: Number((value.totalSpeed / Math.max(value.count, 1)).toFixed(1))
    }));
  }

  return logs.map((log, index) => ({
    label: log.timestamp ? formatTrendTime(log.timestamp) : `Log ${index + 1}`,
    speed: log.speed
  }));
}

function buildActivityTimeline(trips: TelemetryTripSegment[]) {
  return trips.slice(0, 8).map((trip, index) => {
    const tone = trip.distanceKm >= 50 || trip.durationMinutes >= 120 ? 'red' : trip.distanceKm >= 20 ? 'yellow' : 'green';
    return {
      label: trip.startTime
        ? new Date(trip.startTime).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            timeZone: 'Asia/Kolkata'
          })
        : `Trip ${index + 1}`,
      durationMinutes: trip.durationMinutes,
      tone
    } as const;
  });
}

function buildSpeedEvents(logs: TelemetrySpeedLog[]) {
  return logs
    .filter((log) => log.speed > 0)
    .sort((a, b) => b.speed - a.speed)
    .slice(0, 6)
    .map((log) => ({
      label: log.timestamp
        ? new Date(log.timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          })
        : 'Unknown time',
      tone: log.speed >= 80 ? 'red' : log.speed >= 60 ? 'yellow' : 'green',
      details: `${Math.round(log.speed)} km/h · ${log.location}`
    })) as Array<{ label: string; tone: 'green' | 'yellow' | 'red'; details: string }>;
}

function buildSpeedEventTimeline(logs: TelemetrySpeedLog[], overspeedInstances: OverspeedInstance[], overspeedLimit: number) {
  const grouped = new Map<
    string,
    {
      label: string;
      eventCount: number;
      peakSpeed: number;
      totalDurationMinutes: number;
      sessionCount: number;
    }
  >();

  logs
    .filter((log) => log.speed >= overspeedLimit)
    .forEach((log, index) => {
      const dayKey = log.timestamp ? new Date(log.timestamp).toISOString().slice(0, 10) : `log-${index + 1}`;
      const label = dayKey.includes('-') ? formatTrendDate(`${dayKey}T00:00:00`) : `Day ${index + 1}`;
      const current = grouped.get(dayKey) ?? {
        label,
        eventCount: 0,
        peakSpeed: 0,
        totalDurationMinutes: 0,
        sessionCount: 0
      };

      current.eventCount += 1;
      current.peakSpeed = Math.max(current.peakSpeed, log.speed);
      grouped.set(dayKey, current);
    });

  overspeedInstances.forEach((instance) => {
    const referenceTime = instance.startTime ?? instance.endTime;
    const dayKey = referenceTime ? new Date(referenceTime).toISOString().slice(0, 10) : `session-${grouped.size + 1}`;
    const label = dayKey.includes('-') ? formatTrendDate(`${dayKey}T00:00:00`) : `Day ${grouped.size + 1}`;
    const current = grouped.get(dayKey) ?? {
      label,
      eventCount: 0,
      peakSpeed: 0,
      totalDurationMinutes: 0,
      sessionCount: 0
    };

    current.sessionCount += 1;
    current.totalDurationMinutes += instance.durationMinutes;
    current.peakSpeed = Math.max(current.peakSpeed, instance.peakSpeed);
    grouped.set(dayKey, current);
  });

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => {
      const tone = value.peakSpeed >= 80 || value.eventCount >= 6 ? 'red' : value.peakSpeed >= 60 || value.eventCount >= 3 ? 'yellow' : 'green';
      return {
        label: value.label,
        eventCount: value.eventCount,
        peakSpeed: Math.round(value.peakSpeed),
        totalDurationMinutes: Number(value.totalDurationMinutes.toFixed(1)),
        sessionCount: value.sessionCount,
        tone
      } as const;
    });
}

function buildBehaviorIndicators(
  totalDistanceKm: number,
  totalTrips: number,
  maxSpeed: number,
  overspeedCount: number
) {
  const smoothDrivingTone = overspeedCount <= 1 && maxSpeed < 80 ? 'green' : overspeedCount <= 4 ? 'yellow' : 'red';
  const activityTone = totalDistanceKm < 40 ? 'green' : totalDistanceKm < 120 ? 'yellow' : 'red';
  const stopTone = totalTrips <= 3 ? 'green' : totalTrips <= 6 ? 'yellow' : 'red';
  const aggressiveTone = maxSpeed < 75 ? 'green' : maxSpeed < 95 ? 'yellow' : 'red';

  return [
    {
      label: 'Smooth Driving',
      tone: smoothDrivingTone,
      description:
        smoothDrivingTone === 'green'
          ? 'Minimal overspeed behaviour in the selected period.'
          : smoothDrivingTone === 'yellow'
            ? 'Moderate overspeed behaviour detected.'
            : 'High overspeed behaviour needs review.'
    },
    {
      label: 'High Movement Activity',
      tone: activityTone,
      description:
        activityTone === 'green'
          ? 'Low-to-normal movement activity.'
          : activityTone === 'yellow'
            ? 'Sustained movement through the selected range.'
            : 'Heavy movement footprint for the selected period.'
    },
    {
      label: 'Frequent Stops',
      tone: stopTone,
      description:
        stopTone === 'green'
          ? 'Trip count is stable.'
          : stopTone === 'yellow'
            ? 'Moderate trip fragmentation detected.'
            : 'Frequent starts/stops detected across trips.'
    },
    {
      label: 'Aggressive Movement',
      tone: aggressiveTone,
      description:
        aggressiveTone === 'green'
          ? 'Speed pattern looks controlled.'
          : aggressiveTone === 'yellow'
            ? 'Some high-speed behaviour present.'
            : 'High-speed movement suggests risky behaviour.'
    }
  ] satisfies TelemetryBehaviorIndicator[];
}

function getOverspeedSeverity(overspeedCount: number, maxSpeed: number, overspeedDurationMinutes: number) {
  if (overspeedCount >= 10 || maxSpeed >= 90 || overspeedDurationMinutes >= 15) return 'high_risk' as const;
  if (overspeedCount >= 3 || maxSpeed >= 70 || overspeedDurationMinutes >= 3) return 'moderate' as const;
  return 'normal' as const;
}

function buildIdlingAnalytics(idlingSummary: IdlingSummaryRow, idlingSessions: IdlingSession[]) {
  const ignitionCycles = Math.round(toNumber(idlingSummary.IgnitionOnOffCounter, 0));
  const derivedTotalSeconds = idlingSessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  const totalIdlingSeconds = parseDurationToSeconds(idlingSummary.TotalIdlingHours) || derivedTotalSeconds;
  const longestIdleSessionSeconds = idlingSessions.reduce((max, session) => Math.max(max, session.durationSeconds), 0);
  const idleSessionCount = idlingSessions.length;
  const averageIdleSessionSeconds = idleSessionCount ? Math.round(totalIdlingSeconds / idleSessionCount) : 0;

  const scoreFromTotal = Math.min((totalIdlingSeconds / (15 * 60)) * 45, 45);
  const scoreFromLongest = Math.min((longestIdleSessionSeconds / (5 * 60)) * 30, 30);
  const scoreFromCycles = Math.min((ignitionCycles / 20) * 15, 15);
  const scoreFromCount = Math.min((idleSessionCount / 10) * 10, 10);
  const idlingRiskScore = Math.round(Math.min(scoreFromTotal + scoreFromLongest + scoreFromCycles + scoreFromCount, 100));

  let idlingSeverity: VehicleTelemetryData['idlingSeverity'] = 'normal';
  if (totalIdlingSeconds > 30 * 60 || longestIdleSessionSeconds > 10 * 60 || ignitionCycles > 30 || idlingRiskScore >= 70) {
    idlingSeverity = 'critical';
  } else if (totalIdlingSeconds > 15 * 60 || longestIdleSessionSeconds > 5 * 60 || ignitionCycles > 20 || idlingRiskScore >= 35) {
    idlingSeverity = 'warning';
  }

  return {
    ignitionCycles,
    totalIdlingSeconds,
    totalIdlingMinutes: Math.round(totalIdlingSeconds / 60),
    longestIdleSessionSeconds,
    averageIdleSessionSeconds,
    idleSessionCount,
    idlingRiskScore,
    idlingSeverity
  };
}

function buildInsights(data: {
  totalIdlingMinutes: number;
  ignitionCycles: number;
  dayDrivingKm: number;
  nightDrivingKm: number;
  urbanDrivingPct: number;
  ruralDrivingPct: number;
  hillyDrivingPct: number;
  overspeedCount: number;
  overspeedSeverity: VehicleTelemetryData['overspeedSeverity'];
  idlingSeverity: VehicleTelemetryData['idlingSeverity'];
}) {
  const insights: string[] = [];

  if (data.totalIdlingMinutes <= 5) {
    insights.push(`Vehicle spent only ${data.totalIdlingMinutes} minutes idling. Fuel wastage risk is low.`);
  } else if (data.totalIdlingMinutes <= 15) {
    insights.push(`Vehicle idled for ${data.totalIdlingMinutes} minutes. Monitoring is advisable if this pattern continues.`);
  } else {
    insights.push(`Vehicle idled for ${data.totalIdlingMinutes} minutes. Fuel and utilization impact is elevated.`);
  }

  if (data.ignitionCycles <= 8) {
    insights.push(`Vehicle experienced ${data.ignitionCycles} ignition cycles, which is within a healthy operating range.`);
  } else if (data.ignitionCycles <= 20) {
    insights.push(`Vehicle experienced ${data.ignitionCycles} ignition cycles, showing moderate start-stop activity.`);
  } else {
    insights.push(`Vehicle experienced ${data.ignitionCycles} ignition cycles, indicating frequent stop-start behavior.`);
  }

  if (data.dayDrivingKm >= data.nightDrivingKm) {
    insights.push('Most driving occurred during daytime.');
  } else {
    insights.push('Night driving exceeded daytime travel in the selected period.');
  }

  if (data.hillyDrivingPct > 0) {
    insights.push(`Hilly terrain accounted for ${data.hillyDrivingPct.toFixed(1)}% of travel.`);
  } else if (data.urbanDrivingPct >= data.ruralDrivingPct) {
    insights.push(`Urban driving accounted for ${data.urbanDrivingPct.toFixed(1)}% of total travel.`);
  } else {
    insights.push(`Rural driving accounted for ${data.ruralDrivingPct.toFixed(1)}% of total travel.`);
  }

  if (data.overspeedCount === 0) {
    insights.push('Overspeeding events were not detected.');
  } else if (data.overspeedSeverity === 'high_risk') {
    insights.push('Overspeeding patterns suggest high-risk driver behavior.');
  } else {
    insights.push(`Overspeeding events were detected ${data.overspeedCount} time(s), but severity remained ${data.overspeedSeverity}.`);
  }

  if (data.idlingSeverity === 'normal' && data.overspeedSeverity === 'normal') {
    insights.push('Vehicle shows healthy operational behavior.');
  } else if (data.idlingSeverity === 'critical' || data.overspeedSeverity === 'high_risk') {
    insights.push('Vehicle utilization requires attention due to elevated operational risk.');
  }

  return insights;
}

function buildOverspeedInstances(logs: TelemetrySpeedLog[], overspeedLimit: number, reportedDurationMinutes = 0) {
  const instances: OverspeedInstance[] = [];

  if (reportedDurationMinutes > 0 && logs.length) {
    const firstLog = logs[0];
    const lastLog = logs[logs.length - 1];
    return [
      {
        id: `overspeed-${firstLog.id}-${lastLog.id}`,
        startTime: firstLog.timestamp,
        endTime: lastLog.timestamp,
        durationMinutes: Number(reportedDurationMinutes.toFixed(1)),
        peakSpeed: Math.max(...logs.map((log) => log.speed), 0),
        startLocation: firstLog.location,
        endLocation: lastLog.location,
        startLatitude: firstLog.latitude,
        startLongitude: firstLog.longitude,
        endLatitude: lastLog.latitude,
        endLongitude: lastLog.longitude
      }
    ];
  }

  let current: OverspeedInstance | null = null;

  const finalizeCurrent = () => {
    if (!current) return;
    current.durationMinutes = Number(current.durationMinutes.toFixed(1));
    instances.push(current);
    current = null;
  };

  logs.forEach((log, index) => {
    const currentTime = log.timestamp ? new Date(log.timestamp) : null;
    const nextTime = logs[index + 1]?.timestamp ? new Date(logs[index + 1].timestamp as string) : null;
    const nextGapMinutes =
      currentTime && nextTime ? Math.max((nextTime.getTime() - currentTime.getTime()) / 60000, 0) : 0;
    const segmentMinutes = Math.min(nextGapMinutes || 0, 10);

    if (log.speed >= overspeedLimit) {
      if (!current) {
        current = {
          id: log.id,
          startTime: log.timestamp,
          endTime: log.timestamp,
          durationMinutes: 0,
          peakSpeed: log.speed,
          startLocation: log.location,
          endLocation: log.location,
          startLatitude: log.latitude,
          startLongitude: log.longitude,
          endLatitude: log.latitude,
          endLongitude: log.longitude
        };
      }

      current.endTime = log.timestamp;
      current.endLocation = log.location;
      current.endLatitude = log.latitude;
      current.endLongitude = log.longitude;
      current.peakSpeed = Math.max(current.peakSpeed, log.speed);
      current.durationMinutes += segmentMinutes || 0.5;

      const nextLog = logs[index + 1];
      if (!nextLog || nextLog.speed < overspeedLimit || nextGapMinutes > 10) {
        finalizeCurrent();
      }
      return;
    }

    finalizeCurrent();
  });

  finalizeCurrent();
  return instances;
}

function deriveDayNightFromTrips(trips: TelemetryTripSegment[], logs: TelemetrySpeedLog[]) {
  if (trips.length) {
    return trips.reduce(
      (acc, trip) => {
        if (!trip.startTime || !trip.endTime) return acc;
        const start = new Date(trip.startTime);
        const end = new Date(trip.endTime);
        const split = splitDayNightMinutes(start, end);
        const splitDuration = split.dayMinutes + split.nightMinutes;
        const dayDistanceKm = splitDuration ? (trip.distanceKm * split.dayMinutes) / splitDuration : 0;
        const nightDistanceKm = splitDuration ? (trip.distanceKm * split.nightMinutes) / splitDuration : 0;
        return {
          dayMinutes: acc.dayMinutes + split.dayMinutes,
          nightMinutes: acc.nightMinutes + split.nightMinutes,
          dayKm: acc.dayKm + dayDistanceKm,
          nightKm: acc.nightKm + nightDistanceKm
        };
      },
      { dayMinutes: 0, nightMinutes: 0, dayKm: 0, nightKm: 0 }
    );
  }

  if (logs.length > 1) {
    return logs.reduce(
      (acc, log, index) => {
        const current = log.timestamp ? new Date(log.timestamp) : null;
        const next = logs[index + 1]?.timestamp ? new Date(logs[index + 1].timestamp as string) : null;
        if (!current || !next) return acc;
        const cappedEnd = new Date(Math.min(next.getTime(), current.getTime() + 15 * 60 * 1000));
        const split = splitDayNightMinutes(current, cappedEnd);
        return {
          dayMinutes: acc.dayMinutes + split.dayMinutes,
          nightMinutes: acc.nightMinutes + split.nightMinutes,
          dayKm: acc.dayKm,
          nightKm: acc.nightKm
        };
      },
      { dayMinutes: 0, nightMinutes: 0, dayKm: 0, nightKm: 0 }
    );
  }

  return { dayMinutes: 0, nightMinutes: 0, dayKm: 0, nightKm: 0 };
}

const URBAN_LOCATION_KEYWORDS = [
  'road',
  'street',
  'nagar',
  'colony',
  'sector',
  'phase',
  'market',
  'bazar',
  'bazaar',
  'city',
  'town',
  'hospital',
  'school',
  'mall',
  'chowk',
  'junction',
  'station',
  'metro',
  'society',
  'apartment',
  'industrial'
];

const RURAL_LOCATION_KEYWORDS = [
  'village',
  'gaon',
  'farm',
  'kalan',
  'khurd',
  'chak',
  'patti',
  'purwa',
  'khera',
  'tehsil',
  'post',
  'district',
  'taluka'
];

const HILLY_LOCATION_KEYWORDS = ['hill', 'hills', 'ghat', 'ghati', 'mount', 'mountain', 'valley'];

function countKeywordMatches(text: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

function normalizeLocationText(...values: Array<string | null | undefined>) {
  return values
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyTerrainWeightsForTrip(trip: TelemetryTripSegment) {
  const locationText = normalizeLocationText(trip.startLocation, trip.endLocation);
  const urbanHints = countKeywordMatches(locationText, URBAN_LOCATION_KEYWORDS);
  const ruralHints = countKeywordMatches(locationText, RURAL_LOCATION_KEYWORDS);
  const hillyHints = countKeywordMatches(locationText, HILLY_LOCATION_KEYWORDS);
  const avgSpeed = trip.durationMinutes > 0 ? trip.distanceKm / Math.max(trip.durationMinutes / 60, 0.25) : 0;

  let urbanScore = 0;
  let ruralScore = 0;
  let hillyScore = 0;

  urbanScore += urbanHints * 1.5;
  ruralScore += ruralHints * 1.5;
  hillyScore += hillyHints * 2;

  if (avgSpeed > 0) {
    if (avgSpeed <= 28) {
      urbanScore += 2;
    } else if (avgSpeed >= 42) {
      ruralScore += 2;
    } else {
      urbanScore += 1;
      ruralScore += 1;
    }
  }

  if (trip.distanceKm <= 8) urbanScore += 1;
  if (trip.distanceKm >= 35) ruralScore += 1;
  if (trip.durationMinutes <= 20) urbanScore += 0.5;
  if (trip.durationMinutes >= 90) ruralScore += 0.5;

  if (!urbanScore && !ruralScore && !hillyScore) {
    urbanScore = 1;
  }

  const total = urbanScore + ruralScore + hillyScore;
  return {
    urban: total ? urbanScore / total : 1,
    rural: total ? ruralScore / total : 0,
    hilly: total ? hillyScore / total : 0
  };
}

function deriveTerrainMixFromTrips(trips: TelemetryTripSegment[], totalDistanceKm: number) {
  if (!trips.length || totalDistanceKm <= 0) {
    return {
      urbanDrivingKm: totalDistanceKm,
      ruralDrivingKm: 0,
      hillyDrivingKm: 0,
      urbanDrivingPct: totalDistanceKm > 0 ? 100 : 0,
      ruralDrivingPct: 0,
      hillyDrivingPct: 0
    };
  }

  const totals = trips.reduce(
    (acc, trip) => {
      const weights = classifyTerrainWeightsForTrip(trip);
      acc.urbanDrivingKm += trip.distanceKm * weights.urban;
      acc.ruralDrivingKm += trip.distanceKm * weights.rural;
      acc.hillyDrivingKm += trip.distanceKm * weights.hilly;
      return acc;
    },
    { urbanDrivingKm: 0, ruralDrivingKm: 0, hillyDrivingKm: 0 }
  );

  const normalizedTotal = Math.max(totals.urbanDrivingKm + totals.ruralDrivingKm + totals.hillyDrivingKm, 0.01);
  const urbanDrivingKm = Number(totals.urbanDrivingKm.toFixed(2));
  const ruralDrivingKm = Number(totals.ruralDrivingKm.toFixed(2));
  const hillyDrivingKm = Number(totals.hillyDrivingKm.toFixed(2));

  return {
    urbanDrivingKm,
    ruralDrivingKm,
    hillyDrivingKm,
    urbanDrivingPct: Number(((urbanDrivingKm / normalizedTotal) * 100).toFixed(1)),
    ruralDrivingPct: Number(((ruralDrivingKm / normalizedTotal) * 100).toFixed(1)),
    hillyDrivingPct: Number(((hillyDrivingKm / normalizedTotal) * 100).toFixed(1))
  };
}

export function getTelemetryVehicles() {
  return TELEMETRY_VEHICLES;
}

export function getDefaultTelemetryFilter(): TelemetryFilter {
  const today = new Date();
  const previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  const previousDayValue = previousDay.toISOString().slice(0, 10);
  const vehicle = TELEMETRY_VEHICLES[0];

  return {
    vehicleNumber: vehicle.vehicleNumber,
    bbid: vehicle.bbid,
    customerId: vehicle.customerId,
    startDateTime: `${previousDayValue}T00:00:00`,
    endDateTime: `${previousDayValue}T23:59:59`
  };
}

export async function fetchVehicleTelemetry(filter: TelemetryFilter): Promise<VehicleTelemetryData> {
  const [speedResponse, overSpeedResponse, distanceResponse, ignitionResponse, idlingResponse] = await Promise.all([
    fetchSpeedReport(filter),
    fetchOverSpeedReport(filter),
    fetchDistanceReport(filter),
    fetchIgnitionReport(filter),
    fetchIdlingReport(filter)
  ]);
  const speedSummary = normalizeRow(speedResponse?.aaData?.[0]) as SpeedSummaryRow;
  const overSpeedSummary = normalizeRow(overSpeedResponse?.aaData?.[0]) as SpeedSummaryRow;
  const distanceSummary = normalizeRow(distanceResponse?.aaData?.[0]) as DistanceSummaryRow;
  const ignitionSummary = normalizeRow(ignitionResponse?.aaData?.[0]) as IgnitionSummaryRow;
  const idlingSummary = normalizeRow(idlingResponse?.aaData?.[0]) as IdlingSummaryRow;
  const aggregateTrendByDay = getRangeDays(filter) > 3;
  const overspeedLimit = toNumber(overSpeedSummary.overspeedLimit, toNumber(speedSummary.overspeedLimit, 60));
  const speedRows = buildSpeedLogs(Array.isArray(speedSummary.overSpeedData) ? speedSummary.overSpeedData : [], overspeedLimit);
  const overSpeedRows = buildSpeedLogs(Array.isArray(overSpeedSummary.overSpeedData) ? overSpeedSummary.overSpeedData : [], overspeedLimit);
  const distanceTripSegments = buildTripSegments(Array.isArray(distanceSummary.objTravelReport) ? distanceSummary.objTravelReport : []);
  const ignitionSessions = buildIgnitionSessions(Array.isArray(ignitionSummary.objIgnitionStatusReport) ? ignitionSummary.objIgnitionStatusReport : []);
  const idlingSessions = buildIdlingSessions(Array.isArray(idlingSummary.objTravelReport) ? idlingSummary.objTravelReport : []);
  const tripSegments = ignitionSessions.length ? buildTripsFromIgnitionSessions(ignitionSessions, distanceTripSegments) : distanceTripSegments;

  const derivedTotalDistanceKm = Number(distanceTripSegments.reduce((sum, trip) => sum + trip.distanceKm, 0).toFixed(2));
  const totalDistanceKm = Number(toNumber(distanceSummary.TotalDistance, derivedTotalDistanceKm).toFixed(2));
  const totalDrivingDurationMinutes =
    parseDurationToMinutes(ignitionSummary.TotalIgnitionTime) ||
    parseDurationToMinutes(distanceSummary.TotalDuration) ||
    Math.round(tripSegments.reduce((sum, trip) => sum + trip.durationMinutes, 0));
  const maxSpeed = Math.max(
    toNumber(overSpeedSummary.maxSpeed),
    toNumber(speedSummary.maxSpeed),
    ...overSpeedRows.map((row) => row.speed),
    ...speedRows.map((row) => row.speed),
    0
  );
  const overspeedCount = Math.round(
    toNumber(
      overSpeedSummary.overspeedCount,
      toNumber(overSpeedSummary.OverCustomCount, overSpeedRows.length || speedRows.filter((row) => row.overspeed).length)
    )
  );
  const overspeedDurationMinutes = parseDurationToMinutes(overSpeedSummary.overSpeedDuration);
  const overspeedInstances = buildOverspeedInstances(overSpeedRows, overspeedLimit, overspeedDurationMinutes);
  const overspeedSeverity = getOverspeedSeverity(overspeedCount, maxSpeed, overspeedDurationMinutes);
  const idlingAnalytics = buildIdlingAnalytics(idlingSummary, idlingSessions);
  const { dayMinutes, nightMinutes, dayKm, nightKm } = deriveDayNightFromTrips(tripSegments, speedRows);
  const terrainMix = deriveTerrainMixFromTrips(tripSegments, totalDistanceKm);
  const effectiveDuration = Math.max(totalDrivingDurationMinutes, dayMinutes + nightMinutes, 1);
  const dayDrivingPct = Number(((dayMinutes / effectiveDuration) * 100).toFixed(1));
  const nightDrivingPct = Number(((nightMinutes / effectiveDuration) * 100).toFixed(1));
  const speedTrend = buildSpeedTrend(speedRows, aggregateTrendByDay);
  const distanceTrend = buildDistanceTrend(distanceTripSegments.length ? distanceTripSegments : tripSegments, aggregateTrendByDay);
  const activityTimeline = buildActivityTimeline(tripSegments);
  const speedEventTimeline = buildSpeedEventTimeline(overSpeedRows.length ? overSpeedRows : speedRows, overspeedInstances, overspeedLimit);
  const speedEvents = buildSpeedEvents(overSpeedRows.length ? overSpeedRows : speedRows);
  const behaviorIndicators = buildBehaviorIndicators(totalDistanceKm, tripSegments.length, maxSpeed, overspeedCount);
  const insights = buildInsights({
    totalIdlingMinutes: idlingAnalytics.totalIdlingMinutes,
    ignitionCycles: idlingAnalytics.ignitionCycles,
    dayDrivingKm: Number(dayKm.toFixed(2)),
    nightDrivingKm: Number(nightKm.toFixed(2)),
    urbanDrivingPct: terrainMix.urbanDrivingPct,
    ruralDrivingPct: terrainMix.ruralDrivingPct,
    hillyDrivingPct: terrainMix.hillyDrivingPct,
    overspeedCount,
    overspeedSeverity,
    idlingSeverity: idlingAnalytics.idlingSeverity
  });

  return {
    vehicleNumber: filter.vehicleNumber,
    bbid: filter.bbid,
    totalDistanceKm,
    totalDrivingDurationMinutes,
    maxSpeed,
    overspeedCount,
    overspeedDurationMinutes,
    dayDrivingMinutes: Math.round(dayMinutes),
    nightDrivingMinutes: Math.round(nightMinutes),
    dayDrivingKm: Number(dayKm.toFixed(2)),
    nightDrivingKm: Number(nightKm.toFixed(2)),
    dayDrivingPct,
    nightDrivingPct,
    urbanDrivingPct: terrainMix.urbanDrivingPct,
    ruralDrivingPct: terrainMix.ruralDrivingPct,
    hillyDrivingPct: terrainMix.hillyDrivingPct,
    urbanDrivingKm: terrainMix.urbanDrivingKm,
    ruralDrivingKm: terrainMix.ruralDrivingKm,
    hillyDrivingKm: terrainMix.hillyDrivingKm,
    totalTrips: Math.round(toNumber(ignitionSummary.IgnitionOnOffCounter, toNumber(distanceSummary.dataCount, tripSegments.length))),
    cumulativeDistanceKm: distanceTrend.at(-1)?.distanceKm ?? totalDistanceKm,
    speedTrend,
    distanceTrend,
    activityTimeline,
    speedEventTimeline,
    speedEvents,
    speedLogs: speedRows.slice(-12).reverse(),
    overspeedInstances,
    overspeedSeverity,
    totalIdlingMinutes: idlingAnalytics.totalIdlingMinutes,
    totalIdlingSeconds: idlingAnalytics.totalIdlingSeconds,
    ignitionCycles: idlingAnalytics.ignitionCycles,
    longestIdleSessionSeconds: idlingAnalytics.longestIdleSessionSeconds,
    averageIdleSessionSeconds: idlingAnalytics.averageIdleSessionSeconds,
    idleSessionCount: idlingAnalytics.idleSessionCount,
    idlingRiskScore: idlingAnalytics.idlingRiskScore,
    idlingSeverity: idlingAnalytics.idlingSeverity,
    idlingSessions,
    insights,
    tripSegments,
    behaviorIndicators,
    overspeedLimit
  };
}
