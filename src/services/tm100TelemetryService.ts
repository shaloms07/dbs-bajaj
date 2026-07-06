export type TM100PacketFamily = 'DP' | 'LI' | 'EPB' | 'HMP';

export interface TM100ParsedPacket {
  id: string;
  family: TM100PacketFamily;
  familyLabel: string;
  packetTypeCode: string;
  packetTypeLabel: string;
  packetStatus: string | null;
  alertId: number | null;
  timestamp: string | null;
  imei: string;
  vehicleRegNo: string;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  distanceKm: number | null;
  ignition: number | null;
  gpsFix: boolean | null;
  heading: number | null;
  satellites: number | null;
  altitude: number | null;
  batteryPercentage: number | null;
  batteryVoltage: number | null;
  mainVoltage: number | null;
  mainPowerStatus: number | null;
  emergencyStatus: number | null;
  tamperStatus: string | null;
  gsmSignal: number | null;
  operatorName: string | null;
  frameNumber: number | null;
  raw: string;
}

export interface TM100Trip {
  id: string;
  startTime: string | null;
  endTime: string | null;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
  startPacketType: string;
  endPacketType: string;
  distanceKm: number;
  durationMinutes: number;
  maxSpeed: number;
  avgSpeed: number;
  terrainLabel: 'Urban' | 'Mixed' | 'Rural';
}

export interface TM100AlertBreakdownItem {
  code: string;
  label: string;
  count: number;
  tone: 'green' | 'yellow' | 'red';
}

export interface TM100TelemetrySnapshot {
  vehicleNumber: string;
  packets: TM100ParsedPacket[];
  speedTrend: Array<{ label: string; speed: number }>;
  distanceTrend: Array<{ label: string; distanceKm: number }>;
  packetMix: Array<{ name: string; value: number; color: string }>;
  dailyPacketVolume: Array<{ label: string; packets: number }>;
  dayNightMix: Array<{ name: string; value: number; color: string }>;
  terrainMix: Array<{ name: string; value: number; color: string }>;
  tripTimeline: TM100Trip[];
  alertBreakdown: TM100AlertBreakdownItem[];
  insights: string[];
  summary: {
    totalPackets: number;
    normalPackets: number;
    livePackets: number;
    overspeedPackets: number;
    emergencyPackets: number;
    ignitionOnPackets: number;
    totalDistanceKm: number;
    totalTrips: number;
    dayDrivingKm: number;
    nightDrivingKm: number;
    urbanDrivingKm: number;
    ruralDrivingKm: number;
    avgSpeed: number;
    maxSpeed: number;
    gpsValidPackets: number;
    averageBatteryPct: number;
    harshEventPackets: number;
    latestPacket: TM100ParsedPacket | null;
  };
}

const PACKET_TYPE_LABELS: Record<string, string> = {
  NR: 'Normal periodic',
  HP: 'Health packet',
  BD: 'Mains disconnected',
  BL: 'Low battery',
  BH: 'Battery charged',
  BR: 'Mains reconnected',
  IN: 'Ignition on',
  IF: 'Ignition off',
  TA: 'Tamper alert',
  EA: 'Emergency alert',
  CC: 'Configuration OTA',
  HB: 'Harsh braking',
  HA: 'Harsh acceleration',
  RT: 'Harsh/Rash turning',
  DT: 'Device tamper',
  OS: 'Overspeed alert',
  TR: 'Heading angle change',
  LI: 'Login packet',
  EMR: 'Emergency packet',
  HMP: 'Health monitoring'
};

const PACKET_COLORS = ['#005dac', '#0b8666', '#d29b00', '#c92a2a', '#6b7280', '#7c3aed'];

function buildDpPacket(config: {
  packetType: string;
  alertId: number;
  packetStatus?: 'L' | 'H';
  imei: string;
  vehicleRegNo: string;
  date: string;
  time: string;
  latitude: string;
  latitudeDir?: 'N' | 'S';
  longitude: string;
  longitudeDir?: 'E' | 'W';
  speed: string;
  heading: string;
  satellites?: string;
  altitude?: string;
  ignition?: '0' | '1';
  mainPowerStatus?: '0' | '1';
  mainVoltage?: string;
  batteryVoltage?: string;
  emergencyStatus?: '0' | '1';
  tamperStatus?: 'O' | 'C';
  gsmSignal?: string;
  distanceKm?: string;
  frameNumber?: string;
}) {
  const fields = [
    '$DP',
    'B',
    'B100V',
    '4G5017',
    config.packetType,
    String(config.alertId),
    config.packetStatus ?? 'L',
    config.imei,
    config.vehicleRegNo,
    '1',
    config.date,
    config.time,
    config.latitude,
    config.latitudeDir ?? 'N',
    config.longitude,
    config.longitudeDir ?? 'E',
    config.speed,
    config.heading,
    config.satellites ?? '12',
    config.altitude ?? '321',
    '0.8',
    '0.4',
    'AIRTEL',
    config.ignition ?? '1',
    config.mainPowerStatus ?? '1',
    config.mainVoltage ?? '12.68',
    config.batteryVoltage ?? '4.08',
    config.emergencyStatus ?? '0',
    config.tamperStatus ?? 'C',
    config.gsmSignal ?? '29',
    '404',
    '02',
    '337',
    '7DDE415',
    '98EE',
    '-89',
    'E49',
    '7A',
    '-94',
    '0',
    '0',
    '-113',
    '0',
    '0',
    '-113',
    '0000',
    '00',
    '4',
    config.distanceKm ?? '1688.2',
    '0',
    '-10',
    config.frameNumber ?? '46',
    '()',
    '3555B60C*'
  ];

  return fields.join(',');
}

function buildLoginPacket(config: {
  imei: string;
  vehicleRegNo: string;
  latitude: string;
  longitude: string;
}) {
  return [
    '$LI',
    'BOX100',
    '4G5017',
    config.imei,
    '89916490634629449681',
    config.vehicleRegNo,
    config.latitude,
    'N',
    config.longitude,
    'E*'
  ].join(',');
}

function buildEmergencyPacket(config: {
  imei: string;
  vehicleRegNo: string;
  dateTime: string;
  latitude: string;
  longitude: string;
  altitude?: string;
  speed?: string;
  distanceKm?: string;
}) {
  return [
    '$EPB',
    'EMR',
    config.imei,
    'NM',
    config.dateTime,
    'A',
    config.latitude,
    'N',
    config.longitude,
    'E',
    config.altitude ?? '321.0',
    config.speed ?? '0.0',
    config.distanceKm ?? '0.0',
    'G',
    config.vehicleRegNo,
    'NA',
    'FABCF96*'
  ].join(',');
}

function buildHealthPacket(config: {
  imei: string;
  batteryPercentage: string;
  updateRateOn: string;
  updateRateOff: string;
  ignitionStatus: '0' | '1';
}) {
  return [
    '$HMP',
    'BOX100',
    '7S005',
    config.imei,
    config.batteryPercentage,
    '10',
    '0',
    config.updateRateOn,
    config.updateRateOff,
    config.ignitionStatus,
    '0000',
    '04',
    '0',
    '0',
    '*'
  ].join(',');
}

const TM100_RAW_FEEDS: Record<string, string[]> = {
  TEST_VEHICLE: [
    buildLoginPacket({ imei: '860181063592734', vehicleRegNo: 'PB65X1234', latitude: '30.717215', longitude: '76.764511' }),
    buildHealthPacket({ imei: '860181063592734', batteryPercentage: '92', updateRateOn: '120', updateRateOff: '300', ignitionStatus: '0' }),
    buildDpPacket({
      packetType: 'IN',
      alertId: 7,
      imei: '860181063592734',
      vehicleRegNo: 'PB65X1234',
      date: '10062026',
      time: '021500',
      latitude: '30.717215',
      longitude: '76.764511',
      speed: '0.0',
      heading: '0.0',
      ignition: '1',
      distanceKm: '1688.2',
      frameNumber: '101'
    }),
    buildDpPacket({
      packetType: 'NR',
      alertId: 1,
      imei: '860181063592734',
      vehicleRegNo: 'PB65X1234',
      date: '10062026',
      time: '024500',
      latitude: '30.722215',
      longitude: '76.771111',
      speed: '34.2',
      heading: '318.5',
      ignition: '1',
      distanceKm: '1695.8',
      frameNumber: '102'
    }),
    buildDpPacket({
      packetType: 'NR',
      alertId: 1,
      imei: '860181063592734',
      vehicleRegNo: 'PB65X1234',
      date: '10062026',
      time: '040500',
      latitude: '30.731010',
      longitude: '76.782340',
      speed: '48.0',
      heading: '301.4',
      ignition: '1',
      distanceKm: '1711.4',
      frameNumber: '103'
    }),
    buildDpPacket({
      packetType: 'OS',
      alertId: 17,
      imei: '860181063592734',
      vehicleRegNo: 'PB65X1234',
      date: '10062026',
      time: '043000',
      latitude: '30.746320',
      longitude: '76.791440',
      speed: '86.4',
      heading: '297.0',
      ignition: '1',
      distanceKm: '1724.6',
      frameNumber: '104'
    }),
    buildDpPacket({
      packetType: 'IF',
      alertId: 8,
      imei: '860181063592734',
      vehicleRegNo: 'PB65X1234',
      date: '10062026',
      time: '131000',
      latitude: '30.781320',
      longitude: '76.812440',
      speed: '0.0',
      heading: '0.0',
      ignition: '0',
      distanceKm: '1742.2',
      frameNumber: '105'
    })
  ],
  TEST_VEHICLE_135478: [
    buildLoginPacket({ imei: '868329080777299', vehicleRegNo: 'RJ14TM1478', latitude: '26.912434', longitude: '75.787271' }),
    buildHealthPacket({ imei: '868329080777299', batteryPercentage: '88', updateRateOn: '90', updateRateOff: '240', ignitionStatus: '0' }),
    buildDpPacket({
      packetType: 'IN',
      alertId: 7,
      imei: '868329080777299',
      vehicleRegNo: 'RJ14TM1478',
      date: '10062026',
      time: '031000',
      latitude: '26.912434',
      longitude: '75.787271',
      speed: '0.0',
      heading: '0.0',
      ignition: '1',
      distanceKm: '950.1',
      frameNumber: '201'
    }),
    buildDpPacket({
      packetType: 'NR',
      alertId: 1,
      imei: '868329080777299',
      vehicleRegNo: 'RJ14TM1478',
      date: '10062026',
      time: '033500',
      latitude: '26.921204',
      longitude: '75.801310',
      speed: '28.6',
      heading: '180.0',
      ignition: '1',
      distanceKm: '958.4',
      frameNumber: '202'
    }),
    buildDpPacket({
      packetType: 'EA',
      alertId: 10,
      imei: '868329080777299',
      vehicleRegNo: 'RJ14TM1478',
      date: '10062026',
      time: '050500',
      latitude: '26.948004',
      longitude: '75.825510',
      speed: '12.0',
      heading: '210.4',
      ignition: '1',
      emergencyStatus: '1',
      distanceKm: '970.8',
      frameNumber: '203'
    }),
    buildEmergencyPacket({
      imei: '868329080777299',
      vehicleRegNo: 'RJ14TM1478',
      dateTime: '10062026050545',
      latitude: '26.948004',
      longitude: '75.825510',
      altitude: '410.0',
      speed: '12.0',
      distanceKm: '970.8'
    }),
    buildDpPacket({
      packetType: 'OS',
      alertId: 17,
      imei: '868329080777299',
      vehicleRegNo: 'RJ14TM1478',
      date: '10062026',
      time: '071500',
      latitude: '26.976300',
      longitude: '75.860400',
      speed: '79.2',
      heading: '244.1',
      ignition: '1',
      distanceKm: '989.7',
      frameNumber: '204'
    })
  ],
  TEST_VEHICLE_135479: [
    buildLoginPacket({ imei: '868329087183558', vehicleRegNo: 'DL1RTM1479', latitude: '28.613939', longitude: '77.209023' }),
    buildHealthPacket({ imei: '868329087183558', batteryPercentage: '84', updateRateOn: '60', updateRateOff: '180', ignitionStatus: '1' }),
    buildDpPacket({
      packetType: 'NR',
      alertId: 1,
      imei: '868329087183558',
      vehicleRegNo: 'DL1RTM1479',
      date: '10062026',
      time: '020000',
      latitude: '28.613939',
      longitude: '77.209023',
      speed: '22.0',
      heading: '90.4',
      ignition: '0',
      distanceKm: '640.0',
      frameNumber: '301'
    }),
    buildDpPacket({
      packetType: 'IN',
      alertId: 7,
      imei: '868329087183558',
      vehicleRegNo: 'DL1RTM1479',
      date: '10062026',
      time: '030500',
      latitude: '28.621200',
      longitude: '77.217900',
      speed: '0.0',
      heading: '0.0',
      ignition: '1',
      distanceKm: '640.0',
      frameNumber: '302'
    }),
    buildDpPacket({
      packetType: 'NR',
      alertId: 1,
      imei: '868329087183558',
      vehicleRegNo: 'DL1RTM1479',
      date: '10062026',
      time: '041500',
      latitude: '28.635100',
      longitude: '77.226400',
      speed: '31.8',
      heading: '112.0',
      ignition: '1',
      distanceKm: '650.6',
      frameNumber: '303'
    }),
    buildDpPacket({
      packetType: 'TR',
      alertId: 18,
      imei: '868329087183558',
      vehicleRegNo: 'DL1RTM1479',
      date: '10062026',
      time: '045500',
      latitude: '28.649800',
      longitude: '77.241200',
      speed: '37.4',
      heading: '145.8',
      ignition: '1',
      distanceKm: '662.7',
      frameNumber: '304'
    }),
    buildDpPacket({
      packetType: 'IF',
      alertId: 8,
      imei: '868329087183558',
      vehicleRegNo: 'DL1RTM1479',
      date: '10062026',
      time: '094000',
      latitude: '28.672300',
      longitude: '77.258900',
      speed: '0.0',
      heading: '0.0',
      ignition: '0',
      distanceKm: '677.1',
      frameNumber: '305'
    })
  ]
};

function cleanField(value: string | undefined) {
  return (value ?? '').replace(/\*/g, '').trim();
}

function parseNumber(value: string | undefined) {
  const parsed = Number(cleanField(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateTime(dateValue?: string, timeValue?: string) {
  const date = cleanField(dateValue);
  const time = cleanField(timeValue);
  if (date.length !== 8 || time.length !== 6) return null;

  const day = date.slice(0, 2);
  const month = date.slice(2, 4);
  const year = date.slice(4, 8);
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  const seconds = time.slice(4, 6);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

function parseCombinedDateTime(value?: string) {
  const normalized = cleanField(value);
  if (normalized.length !== 14) return null;
  return `${normalized.slice(4, 8)}-${normalized.slice(2, 4)}-${normalized.slice(0, 2)}T${normalized.slice(8, 10)}:${normalized.slice(10, 12)}:${normalized.slice(12, 14)}Z`;
}

function parseCoordinate(value?: string, direction?: string) {
  const numeric = parseNumber(value);
  if (numeric == null) return null;
  const axis = cleanField(direction).toUpperCase();
  if (axis === 'S' || axis === 'W') return numeric * -1;
  return numeric;
}

function formatPacketDay(timestamp: string | null) {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata'
  });
}

function formatPacketMoment(timestamp: string | null) {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
}

function parseDpPacket(raw: string, fields: string[], index: number): TM100ParsedPacket {
  const packetTypeCode = cleanField(fields[4]);
  return {
    id: `dp-${index}`,
    family: 'DP',
    familyLabel: 'Data packet',
    packetTypeCode,
    packetTypeLabel: PACKET_TYPE_LABELS[packetTypeCode] ?? packetTypeCode,
    packetStatus: cleanField(fields[6]) || null,
    alertId: parseNumber(fields[5]),
    timestamp: parseDateTime(fields[10], fields[11]),
    imei: cleanField(fields[7]),
    vehicleRegNo: cleanField(fields[8]),
    latitude: parseCoordinate(fields[12], fields[13]),
    longitude: parseCoordinate(fields[14], fields[15]),
    speed: parseNumber(fields[16]),
    distanceKm: parseNumber(fields[49]),
    ignition: parseNumber(fields[23]),
    gpsFix: cleanField(fields[9]) === '1',
    heading: parseNumber(fields[17]),
    satellites: parseNumber(fields[18]),
    altitude: parseNumber(fields[19]),
    batteryPercentage: null,
    batteryVoltage: parseNumber(fields[26]),
    mainVoltage: parseNumber(fields[25]),
    mainPowerStatus: parseNumber(fields[24]),
    emergencyStatus: parseNumber(fields[27]),
    tamperStatus: cleanField(fields[28]) || null,
    gsmSignal: parseNumber(fields[29]),
    operatorName: cleanField(fields[22]) || null,
    frameNumber: parseNumber(fields[52]),
    raw
  };
}

function parseLoginPacket(raw: string, fields: string[], index: number): TM100ParsedPacket {
  return {
    id: `li-${index}`,
    family: 'LI',
    familyLabel: 'Login packet',
    packetTypeCode: 'LI',
    packetTypeLabel: PACKET_TYPE_LABELS.LI,
    packetStatus: null,
    alertId: null,
    timestamp: null,
    imei: cleanField(fields[3]),
    vehicleRegNo: cleanField(fields[5]),
    latitude: parseCoordinate(fields[6], fields[7]),
    longitude: parseCoordinate(fields[8], fields[9]),
    speed: null,
    distanceKm: null,
    ignition: null,
    gpsFix: true,
    heading: null,
    satellites: null,
    altitude: null,
    batteryPercentage: null,
    batteryVoltage: null,
    mainVoltage: null,
    mainPowerStatus: null,
    emergencyStatus: null,
    tamperStatus: null,
    gsmSignal: null,
    operatorName: null,
    frameNumber: null,
    raw
  };
}

function parseEmergencyPacket(raw: string, fields: string[], index: number): TM100ParsedPacket {
  return {
    id: `epb-${index}`,
    family: 'EPB',
    familyLabel: 'Emergency packet',
    packetTypeCode: cleanField(fields[1]),
    packetTypeLabel: PACKET_TYPE_LABELS[cleanField(fields[1])] ?? cleanField(fields[1]),
    packetStatus: cleanField(fields[3]) || null,
    alertId: null,
    timestamp: parseCombinedDateTime(fields[4]),
    imei: cleanField(fields[2]),
    vehicleRegNo: cleanField(fields[14]),
    latitude: parseCoordinate(fields[6], fields[7]),
    longitude: parseCoordinate(fields[8], fields[9]),
    speed: parseNumber(fields[11]),
    distanceKm: parseNumber(fields[12]),
    ignition: null,
    gpsFix: cleanField(fields[5]).toUpperCase() === 'A',
    heading: null,
    satellites: null,
    altitude: parseNumber(fields[10]),
    batteryPercentage: null,
    batteryVoltage: null,
    mainVoltage: null,
    mainPowerStatus: null,
    emergencyStatus: 1,
    tamperStatus: null,
    gsmSignal: null,
    operatorName: cleanField(fields[13]) || null,
    frameNumber: null,
    raw
  };
}

function parseHealthPacket(raw: string, fields: string[], index: number): TM100ParsedPacket {
  return {
    id: `hmp-${index}`,
    family: 'HMP',
    familyLabel: 'Health monitoring',
    packetTypeCode: 'HMP',
    packetTypeLabel: PACKET_TYPE_LABELS.HMP,
    packetStatus: null,
    alertId: null,
    timestamp: null,
    imei: cleanField(fields[3]),
    vehicleRegNo: '',
    latitude: null,
    longitude: null,
    speed: null,
    distanceKm: null,
    ignition: parseNumber(fields[9]),
    gpsFix: null,
    heading: null,
    satellites: null,
    altitude: null,
    batteryPercentage: parseNumber(fields[4]),
    batteryVoltage: null,
    mainVoltage: null,
    mainPowerStatus: null,
    emergencyStatus: null,
    tamperStatus: null,
    gsmSignal: null,
    operatorName: null,
    frameNumber: null,
    raw
  };
}

export function parseTM100Packet(raw: string, index: number) {
  const fields = raw.split(',').map((field) => field.trim());
  const family = cleanField(fields[0]).replace('$', '').toUpperCase() as TM100PacketFamily;

  if (family === 'DP') return parseDpPacket(raw, fields, index);
  if (family === 'LI') return parseLoginPacket(raw, fields, index);
  if (family === 'EPB') return parseEmergencyPacket(raw, fields, index);
  return parseHealthPacket(raw, fields, index);
}

function getIndiaHour(timestamp: string | null) {
  if (!timestamp) return null;
  const parts = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Kolkata'
  }).formatToParts(new Date(timestamp));
  const hourPart = parts.find((part) => part.type === 'hour')?.value;
  return hourPart ? Number(hourPart) : null;
}

function getSegmentTerrainWeights(speed: number) {
  if (speed <= 28) return { urban: 1, rural: 0, label: 'Urban' as const };
  if (speed >= 45) return { urban: 0, rural: 1, label: 'Rural' as const };
  if (speed <= 36) return { urban: 0.7, rural: 0.3, label: 'Mixed' as const };
  return { urban: 0.35, rural: 0.65, label: 'Mixed' as const };
}

function buildTm100Trips(packets: TM100ParsedPacket[]) {
  const datedPackets = packets
    .filter((packet) => packet.timestamp)
    .sort((left, right) => (left.timestamp ?? '').localeCompare(right.timestamp ?? ''));

  const trips: TM100Trip[] = [];
  let activeTripPackets: TM100ParsedPacket[] = [];

  const finalizeTrip = () => {
    if (activeTripPackets.length < 2) {
      activeTripPackets = [];
      return;
    }

    const first = activeTripPackets[0];
    const last = activeTripPackets[activeTripPackets.length - 1];
    const distanceKm = Math.max((last.distanceKm ?? 0) - (first.distanceKm ?? 0), 0);
    const durationMinutes =
      first.timestamp && last.timestamp ? Math.max((new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 60000, 0) : 0;
    const speedValues = activeTripPackets.map((packet) => packet.speed ?? 0).filter((speed) => speed > 0);
    const avgSpeed = speedValues.length ? speedValues.reduce((sum, speed) => sum + speed, 0) / speedValues.length : 0;
    const terrain = getSegmentTerrainWeights(avgSpeed);

    trips.push({
      id: `trip-${trips.length + 1}`,
      startTime: first.timestamp,
      endTime: last.timestamp,
      startLatitude: first.latitude,
      startLongitude: first.longitude,
      endLatitude: last.latitude,
      endLongitude: last.longitude,
      startPacketType: first.packetTypeCode,
      endPacketType: last.packetTypeCode,
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMinutes: Math.round(durationMinutes),
      maxSpeed: speedValues.length ? Math.max(...speedValues) : 0,
      avgSpeed: Number(avgSpeed.toFixed(1)),
      terrainLabel: terrain.label
    });

    activeTripPackets = [];
  };

  datedPackets.forEach((packet) => {
    const startsTrip = packet.packetTypeCode === 'IN' || (packet.ignition === 1 && activeTripPackets.length === 0);
    const endsTrip = packet.packetTypeCode === 'IF' || packet.ignition === 0;

    if (startsTrip && activeTripPackets.length === 0) {
      activeTripPackets.push(packet);
      return;
    }

    if (activeTripPackets.length > 0) {
      activeTripPackets.push(packet);
    }

    if (endsTrip && activeTripPackets.length > 0) {
      finalizeTrip();
    }
  });

  finalizeTrip();
  return trips;
}

function buildTm100Analytics(packets: TM100ParsedPacket[]) {
  const movementPackets = packets
    .filter((packet) => packet.timestamp && packet.distanceKm != null)
    .sort((left, right) => (left.timestamp ?? '').localeCompare(right.timestamp ?? ''));

  let totalDistanceKm = 0;
  let dayDrivingKm = 0;
  let nightDrivingKm = 0;
  let urbanDrivingKm = 0;
  let ruralDrivingKm = 0;

  const distanceByDay = new Map<string, number>();

  for (let index = 1; index < movementPackets.length; index += 1) {
    const previous = movementPackets[index - 1];
    const current = movementPackets[index];
    const deltaKm = Math.max((current.distanceKm ?? 0) - (previous.distanceKm ?? 0), 0);
    if (!deltaKm) continue;

    totalDistanceKm += deltaKm;
    const dayKey = formatPacketDay(current.timestamp);
    distanceByDay.set(dayKey, Number(((distanceByDay.get(dayKey) ?? 0) + deltaKm).toFixed(1)));

    const localHour = getIndiaHour(current.timestamp);
    if (localHour != null && (localHour >= 22 || localHour < 6)) {
      nightDrivingKm += deltaKm;
    } else {
      dayDrivingKm += deltaKm;
    }

    const averageSpeed = ((previous.speed ?? 0) + (current.speed ?? 0)) / 2;
    const terrain = getSegmentTerrainWeights(averageSpeed);
    urbanDrivingKm += deltaKm * terrain.urban;
    ruralDrivingKm += deltaKm * terrain.rural;
  }

  const distanceTrend = Array.from(distanceByDay.entries()).map(([label, distanceKm]) => ({
    label,
    distanceKm: Number(distanceKm.toFixed(1))
  }));

  return {
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    dayDrivingKm: Number(dayDrivingKm.toFixed(1)),
    nightDrivingKm: Number(nightDrivingKm.toFixed(1)),
    urbanDrivingKm: Number(urbanDrivingKm.toFixed(1)),
    ruralDrivingKm: Number(ruralDrivingKm.toFixed(1)),
    distanceTrend
  };
}

function buildAlertBreakdown(packets: TM100ParsedPacket[]) {
  const interestingCodes = ['OS', 'EA', 'EPB', 'HA', 'HB', 'RT', 'TR', 'TA', 'DT', 'BD', 'BL', 'BH', 'BR', 'IN', 'IF'];
  const counts = new Map<string, number>();

  packets.forEach((packet) => {
    const code = packet.family === 'EPB' ? 'EPB' : packet.packetTypeCode;
    if (!interestingCodes.includes(code)) return;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([code, count]) => ({
    code,
    label: code === 'EPB' ? 'Emergency packet' : PACKET_TYPE_LABELS[code] ?? code,
    count,
    tone:
      code === 'OS' || code === 'EA' || code === 'EPB'
        ? ('red' as const)
        : code === 'IN' || code === 'IF' || code === 'TR'
          ? ('yellow' as const)
          : ('green' as const)
  }));
}

function buildInsights(summary: TM100TelemetrySnapshot['summary'], alertBreakdown: TM100AlertBreakdownItem[]) {
  const insights: string[] = [];

  insights.push(`TM100 packets show ${summary.totalDistanceKm.toFixed(1)} km of movement built from cumulative distance progression.`);
  insights.push(
    summary.nightDrivingKm > 0
      ? `${summary.nightDrivingKm.toFixed(1)} km is estimated as night driving using the 10 PM to 6 AM rule.`
      : 'No night-driving distance was detected in the current raw TM100 sample.'
  );
  insights.push(
    summary.urbanDrivingKm >= summary.ruralDrivingKm
      ? `Urban-heavy movement is estimated from lower average segment speeds (${summary.urbanDrivingKm.toFixed(1)} km urban vs ${summary.ruralDrivingKm.toFixed(1)} km rural).`
      : `Rural/open-road movement is estimated from higher average segment speeds (${summary.ruralDrivingKm.toFixed(1)} km rural vs ${summary.urbanDrivingKm.toFixed(1)} km urban).`
  );

  const overspeedCount = alertBreakdown.find((item) => item.code === 'OS')?.count ?? 0;
  const emergencyCount = alertBreakdown.filter((item) => item.code === 'EA' || item.code === 'EPB').reduce((sum, item) => sum + item.count, 0);
  insights.push(
    overspeedCount > 0
      ? `Overspeed protocol alerts appeared ${overspeedCount} time(s) in the raw feed.`
      : 'No overspeed TM100 alert code was seen in the current sample.'
  );
  insights.push(
    emergencyCount > 0
      ? `Emergency-related packets were emitted ${emergencyCount} time(s), so the raw alert pipeline is visible end to end.`
      : 'No emergency packets were emitted in the current sample window.'
  );

  return insights;
}

export function getTM100TelemetrySnapshot(vehicleNumber: string): TM100TelemetrySnapshot {
  const rawFeed = TM100_RAW_FEEDS[vehicleNumber] ?? TM100_RAW_FEEDS.TEST_VEHICLE;
  const packets = rawFeed.map((packet, index) => parseTM100Packet(packet, index));

  const speedPackets = packets
    .filter((packet) => packet.speed != null && packet.timestamp)
    .sort((left, right) => (left.timestamp ?? '').localeCompare(right.timestamp ?? ''));

  const speedTrend = speedPackets.map((packet) => ({
    label: formatPacketMoment(packet.timestamp),
    speed: packet.speed ?? 0
  }));
  const trips = buildTm100Trips(packets);
  const analytics = buildTm100Analytics(packets);
  const alertBreakdown = buildAlertBreakdown(packets);

  const packetMixMap = packets.reduce((accumulator, packet) => {
    accumulator.set(packet.packetTypeLabel, (accumulator.get(packet.packetTypeLabel) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  const packetMix = Array.from(packetMixMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: PACKET_COLORS[index % PACKET_COLORS.length]
  }));

  const packetVolumeMap = packets.reduce((accumulator, packet) => {
    const key = formatPacketDay(packet.timestamp);
    accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  const dailyPacketVolume = Array.from(packetVolumeMap.entries()).map(([label, packetCount]) => ({
    label,
    packets: packetCount
  }));
  const dayNightMix = [
    { name: 'Day km', value: analytics.dayDrivingKm, color: '#0b8666' },
    { name: 'Night km', value: analytics.nightDrivingKm, color: '#d29b00' }
  ];
  const terrainMix = [
    { name: 'Urban km', value: analytics.urbanDrivingKm, color: '#005dac' },
    { name: 'Rural km', value: analytics.ruralDrivingKm, color: '#0b8666' }
  ];

  const speedValues = speedPackets.map((packet) => packet.speed ?? 0);
  const batteryValues = packets.map((packet) => packet.batteryPercentage).filter((value): value is number => value != null);
  const latestPacket =
    packets.findLast((packet) => packet.timestamp != null) ??
    packets.find((packet) => packet.family === 'LI') ??
    packets[0] ??
    null;
  const summary: TM100TelemetrySnapshot['summary'] = {
    totalPackets: packets.length,
    normalPackets: packets.filter((packet) => packet.packetTypeCode === 'NR').length,
    livePackets: packets.filter((packet) => packet.packetStatus === 'L').length,
    overspeedPackets: packets.filter((packet) => packet.packetTypeCode === 'OS').length,
    emergencyPackets: packets.filter((packet) => packet.family === 'EPB' || packet.packetTypeCode === 'EA').length,
    ignitionOnPackets: packets.filter((packet) => packet.packetTypeCode === 'IN' || packet.ignition === 1).length,
    totalDistanceKm: analytics.totalDistanceKm,
    totalTrips: trips.length,
    dayDrivingKm: analytics.dayDrivingKm,
    nightDrivingKm: analytics.nightDrivingKm,
    urbanDrivingKm: analytics.urbanDrivingKm,
    ruralDrivingKm: analytics.ruralDrivingKm,
    avgSpeed: speedValues.length ? Number((speedValues.reduce((sum, speed) => sum + speed, 0) / speedValues.length).toFixed(1)) : 0,
    maxSpeed: speedValues.length ? Math.max(...speedValues) : 0,
    gpsValidPackets: packets.filter((packet) => packet.gpsFix === true).length,
    averageBatteryPct: batteryValues.length
      ? Number((batteryValues.reduce((sum, battery) => sum + battery, 0) / batteryValues.length).toFixed(1))
      : 0,
    harshEventPackets: packets.filter((packet) => ['HA', 'HB', 'RT', 'TR'].includes(packet.packetTypeCode)).length,
    latestPacket
  };
  const insights = buildInsights(summary, alertBreakdown);

  return {
    vehicleNumber,
    packets,
    speedTrend,
    distanceTrend: analytics.distanceTrend,
    packetMix,
    dailyPacketVolume,
    dayNightMix,
    terrainMix,
    tripTimeline: trips,
    alertBreakdown,
    insights,
    summary
  };
}

export function getTM100Vehicles(): Array<{ vehicleNumber: string; customerId: string; label: string }> {
  return Object.keys(TM100_RAW_FEEDS).map((key) => ({
    vehicleNumber: key,
    customerId: key,
    label: key.replace(/_/g, ' ')
  }));
}
