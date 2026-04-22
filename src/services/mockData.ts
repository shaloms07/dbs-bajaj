import { ScoreResult } from '../types/score';

export const sampleVehicleScores: Record<string, ScoreResult> = {
  MH31AB1234: {
    regNo: 'MH31AB1234',
    vehicleType: 'Private Car',
    score: 290,
    band: 'EXEMPLARY',
    severityIndex: 8,
    recentTrend: 'Up',
    challanStatus: 'Clear',
    tpLoading: 0,
    violations: [
      { type: 'Wrong Parking', date: '2026-02-11', location: 'Pune', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  RJ14KL7788: {
    regNo: 'RJ14KL7788',
    vehicleType: 'Private Car',
    score: 280,
    band: 'RESPONSIBLE',
    severityIndex: 16,
    recentTrend: 'Stable',
    challanStatus: 'Clear',
    tpLoading: 0,
    violations: [
      { type: 'Vehicle Modification', date: '2026-01-08', location: 'Jaipur', thz: 'L', status: 'Paid', impact: 20 }
    ]
  },
  UP32CD5678: {
    regNo: 'UP32CD5678',
    vehicleType: 'Two Wheeler',
    score: 260,
    band: 'AVERAGE',
    severityIndex: 28,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 1200,
    violations: [
      { type: 'Helmet violation', date: '2026-02-10', location: 'Lucknow', thz: 'M', status: 'Open', impact: 30 },
      { type: 'Wrong Parking', date: '2025-11-18', location: 'Kanpur', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  GJ05QW3344: {
    regNo: 'GJ05QW3344',
    vehicleType: 'Private Car',
    score: 230,
    band: 'MARGINAL',
    severityIndex: 40,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 2400,
    violations: [
      { type: 'Wrong Lane', date: '2026-03-02', location: 'Surat', thz: 'H', status: 'Open', impact: 60 },
      { type: 'Wrong Parking', date: '2025-12-18', location: 'Surat', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  DL8CAF9012: {
    regNo: 'DL8CAF9012',
    vehicleType: 'Goods Vehicle',
    score: 190,
    band: 'AT_RISK',
    severityIndex: 55,
    recentTrend: 'Stable',
    challanStatus: 'Pending',
    tpLoading: 3600,
    violations: [
      { type: 'Overspeeding', date: '2026-01-25', location: 'Delhi', thz: 'H', status: 'Paid', impact: 80 },
      { type: 'Vehicle Modification', date: '2025-12-12', location: 'Delhi', thz: 'L', status: 'Paid', impact: 20 },
      { type: 'Wrong Parking', date: '2025-10-03', location: 'Delhi', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  KA01MN3456: {
    regNo: 'KA01MN3456',
    vehicleType: 'Private Car',
    score: 170,
    band: 'HIGH_RISK',
    severityIndex: 68,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 5200,
    violations: [
      { type: 'Signal Jump', date: '2026-03-07', location: 'Bengaluru', thz: 'H', status: 'Open', impact: 90 },
      { type: 'No Seatbelt', date: '2026-02-19', location: 'Bengaluru', thz: 'M', status: 'Paid', impact: 30 },
      { type: 'Wrong Parking', date: '2025-09-14', location: 'Bengaluru', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  AP39ZX5566: {
    regNo: 'AP39ZX5566',
    vehicleType: 'Private Car',
    score: 130,
    band: 'SERIOUS_RISK',
    severityIndex: 80,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 6800,
    violations: [
      { type: 'Wrong Lane', date: '2026-03-14', location: 'Vijayawada', thz: 'H', status: 'Open', impact: 60 },
      { type: 'Vehicle Modification', date: '2026-02-27', location: 'Vijayawada', thz: 'L', status: 'Open', impact: 20 },
      { type: 'Vehicle Modification', date: '2025-12-21', location: 'Guntur', thz: 'L', status: 'Paid', impact: 20 },
      { type: 'Vehicle Modification', date: '2025-10-03', location: 'Guntur', thz: 'L', status: 'Paid', impact: 40 },
      { type: 'Helmet violation', date: '2025-08-18', location: 'Vijayawada', thz: 'M', status: 'Paid', impact: 30 }
    ]
  },
  WB20LM4433: {
    regNo: 'WB20LM4433',
    vehicleType: 'Two Wheeler',
    score: 110,
    band: 'CHRONIC_VIOLATOR',
    severityIndex: 88,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 8200,
    violations: [
      { type: 'No Helmet', date: '2026-03-10', location: 'Kolkata', thz: 'H', status: 'Open', impact: 30 },
      { type: 'No Helmet', date: '2026-02-05', location: 'Kolkata', thz: 'H', status: 'Paid', impact: 30 },
      { type: 'No Helmet', date: '2025-12-30', location: 'Kolkata', thz: 'H', status: 'Paid', impact: 60 },
      { type: 'No Helmet', date: '2025-11-02', location: 'Kolkata', thz: 'H', status: 'Paid', impact: 60 },
      { type: 'Wrong Parking', date: '2025-09-19', location: 'Kolkata', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  MP09RS7711: {
    regNo: 'MP09RS7711',
    vehicleType: 'Goods Vehicle',
    score: 60,
    band: 'HABITUAL_OFFENDER',
    severityIndex: 94,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 9600,
    violations: [
      { type: 'Overloading', date: '2026-03-06', location: 'Bhopal', thz: 'H', status: 'Open', impact: 40 },
      { type: 'Overloading', date: '2026-01-19', location: 'Bhopal', thz: 'H', status: 'Paid', impact: 40 },
      { type: 'Overloading', date: '2025-11-22', location: 'Bhopal', thz: 'H', status: 'Paid', impact: 80 },
      { type: 'Overloading', date: '2025-10-10', location: 'Bhopal', thz: 'H', status: 'Paid', impact: 80 }
    ]
  },
  TN09GH1122: {
    regNo: 'TN09GH1122',
    vehicleType: 'Private Car',
    score: 20,
    band: 'EXTREME_RISK',
    severityIndex: 99,
    recentTrend: 'Down',
    challanStatus: 'Pending',
    tpLoading: 12000,
    violations: [
      { type: 'Drunk Driving', date: '2026-03-11', location: 'Chennai', thz: 'H', status: 'Open', impact: 100 },
      { type: 'Overspeeding', date: '2026-02-22', location: 'Chennai', thz: 'H', status: 'Open', impact: 80 },
      { type: 'Overspeeding', date: '2025-12-09', location: 'Chennai', thz: 'H', status: 'Paid', impact: 80 },
      { type: 'Wrong Parking', date: '2025-10-28', location: 'Chennai', thz: 'L', status: 'Paid', impact: 10 },
      { type: 'Wrong Parking', date: '2025-08-02', location: 'Chennai', thz: 'L', status: 'Paid', impact: 10 }
    ]
  }
};
