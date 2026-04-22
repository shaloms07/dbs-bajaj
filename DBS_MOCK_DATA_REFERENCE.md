# DBS Mock Data Reference

This file is the handoff reference for reproducing the same example data in another DBS application.

## Purpose

Use this document as the source of truth for:

- sample vehicle records
- sample registration numbers shown in lookup flows
- score bands used in the UI
- repeat-offence examples
- violation history examples that should appear in the dashboard

## Notes

- Score scale: `0-300`
- Assessment window: `last 12 months`
- Starting score: `300`
- Lower score means higher risk
- Current mock source in this app: `src/services/mockData.ts`
- Current quick-sample list in `src/pages/VehicleLookup.tsx` includes one extra reg number, `HR26TT9090`, which does not currently exist in `src/services/mockData.ts`

## Score Bands

| Score Range | Band |
|---|---|
| 285-300 | Exemplary |
| 270-284 | Responsible |
| 240-269 | Average |
| 210-239 | Marginal |
| 180-209 | At Risk |
| 150-179 | High Risk |
| 120-149 | Serious Risk |
| 90-119 | Chronic Violator |
| 60-89 | Habitual Offender |
| Below 60 | Extreme Risk |

## Repeat Multiplier Logic

| Same Offence Count Within 12 Months | Multiplier |
|---|---|
| 1st-2nd | 1x |
| 3rd-4th | 2x |
| 5th-6th | 3x |
| 7th+ | 3x |

## Quick Sample Registration Numbers

These are the sample reg numbers currently exposed in the app lookup experience:

- `MH31AB1234`
- `UP32CD5678`
- `DL8CAF9012`
- `KA01MN3456`
- `TN09GH1122`
- `RJ14KL7788`
- `GJ05QW3344`
- `AP39ZX5566`
- `HR26TT9090` `not present in current mock dataset`
- `WB20LM4433`
- `MP09RS7711`

## Vehicle Dataset

### 1. `MH31AB1234`

- Vehicle Type: `Private Car`
- Score: `290`
- Band: `EXEMPLARY`
- Severity Index: `8`
- Recent Trend: `Up`
- Challan Status: `Clear`
- TP Loading: `0`
- Purpose in demo: clean, near-perfect example

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-02-11 | Wrong Parking | Pune | L | Paid | 10 |

### 2. `RJ14KL7788`

- Vehicle Type: `Private Car`
- Score: `280`
- Band: `RESPONSIBLE`
- Severity Index: `16`
- Recent Trend: `Stable`
- Challan Status: `Clear`
- TP Loading: `0`
- Purpose in demo: isolated minor lapse

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-01-08 | Vehicle Modification | Jaipur | L | Paid | 20 |

### 3. `UP32CD5678`

- Vehicle Type: `Two Wheeler`
- Score: `260`
- Band: `AVERAGE`
- Severity Index: `28`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `1200`
- Purpose in demo: average profile with mixed-severity offences

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-02-10 | Helmet violation | Lucknow | M | Open | 30 |
| 2025-11-18 | Wrong Parking | Kanpur | L | Paid | 10 |

### 4. `GJ05QW3344`

- Vehicle Type: `Private Car`
- Score: `230`
- Band: `MARGINAL`
- Severity Index: `40`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `2400`
- Purpose in demo: marginal driver with one major and one minor offence

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-02 | Wrong Lane | Surat | H | Open | 60 |
| 2025-12-18 | Wrong Parking | Surat | L | Paid | 10 |

### 5. `DL8CAF9012`

- Vehicle Type: `Goods Vehicle`
- Score: `190`
- Band: `AT_RISK`
- Severity Index: `55`
- Recent Trend: `Stable`
- Challan Status: `Pending`
- TP Loading: `3600`
- Purpose in demo: repeated medium-risk freight example

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-01-25 | Overspeeding | Delhi | H | Paid | 80 |
| 2025-12-12 | Vehicle Modification | Delhi | L | Paid | 20 |
| 2025-10-03 | Wrong Parking | Delhi | L | Paid | 10 |

### 6. `KA01MN3456`

- Vehicle Type: `Private Car`
- Score: `170`
- Band: `HIGH_RISK`
- Severity Index: `68`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `5200`
- Purpose in demo: high-risk private car with a serious recent offence

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-07 | Signal Jump | Bengaluru | H | Open | 90 |
| 2026-02-19 | No Seatbelt | Bengaluru | M | Paid | 30 |
| 2025-09-14 | Wrong Parking | Bengaluru | L | Paid | 10 |

### 7. `AP39ZX5566`

- Vehicle Type: `Private Car`
- Score: `130`
- Band: `SERIOUS_RISK`
- Severity Index: `80`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `6800`
- Purpose in demo: repeated offence multiplier example using repeated vehicle modifications

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-14 | Wrong Lane | Vijayawada | H | Open | 60 |
| 2026-02-27 | Vehicle Modification | Vijayawada | L | Open | 20 |
| 2025-12-21 | Vehicle Modification | Guntur | L | Paid | 20 |
| 2025-10-03 | Vehicle Modification | Guntur | L | Paid | 40 |
| 2025-08-18 | Helmet violation | Vijayawada | M | Paid | 30 |

Repeat pattern to preserve:

- `Vehicle Modification` occurs 3 times within 12 months
- expected repeat multipliers for those 3 instances: `1x`, `1x`, `2x`

### 8. `WB20LM4433`

- Vehicle Type: `Two Wheeler`
- Score: `110`
- Band: `CHRONIC_VIOLATOR`
- Severity Index: `88`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `8200`
- Purpose in demo: chronic repeated helmet violations

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-10 | No Helmet | Kolkata | H | Open | 30 |
| 2026-02-05 | No Helmet | Kolkata | H | Paid | 30 |
| 2025-12-30 | No Helmet | Kolkata | H | Paid | 60 |
| 2025-11-02 | No Helmet | Kolkata | H | Paid | 60 |
| 2025-09-19 | Wrong Parking | Kolkata | L | Paid | 10 |

Repeat pattern to preserve:

- `No Helmet` occurs 4 times within 12 months
- expected repeat multipliers: `1x`, `1x`, `2x`, `2x`

### 9. `MP09RS7711`

- Vehicle Type: `Goods Vehicle`
- Score: `60`
- Band: `HABITUAL_OFFENDER`
- Severity Index: `94`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `9600`
- Purpose in demo: heavy repeated overloading case

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-06 | Overloading | Bhopal | H | Open | 40 |
| 2026-01-19 | Overloading | Bhopal | H | Paid | 40 |
| 2025-11-22 | Overloading | Bhopal | H | Paid | 80 |
| 2025-10-10 | Overloading | Bhopal | H | Paid | 80 |

Repeat pattern to preserve:

- `Overloading` occurs 4 times within 12 months
- expected repeat multipliers: `1x`, `1x`, `2x`, `2x`

### 10. `TN09GH1122`

- Vehicle Type: `Private Car`
- Score: `20`
- Band: `EXTREME_RISK`
- Severity Index: `99`
- Recent Trend: `Down`
- Challan Status: `Pending`
- TP Loading: `12000`
- Purpose in demo: worst-case driver with mixed severe offences

Violations:

| Date | Type | Location | THZ | Status | Impact |
|---|---|---|---|---|---|
| 2026-03-11 | Drunk Driving | Chennai | H | Open | 100 |
| 2026-02-22 | Overspeeding | Chennai | H | Open | 80 |
| 2025-12-09 | Overspeeding | Chennai | H | Paid | 80 |
| 2025-10-28 | Wrong Parking | Chennai | L | Paid | 10 |
| 2025-08-02 | Wrong Parking | Chennai | L | Paid | 10 |

Repeat pattern to preserve:

- `Overspeeding` occurs 2 times within 12 months
- expected repeat multipliers: `1x`, `1x`
- `Wrong Parking` occurs 2 times within 12 months
- expected repeat multipliers: `1x`, `1x`

## JSON-Shaped Handoff Summary

Use this shape if another AI needs a compact spec:

```json
{
  "score_scale": "0-300",
  "window_months": 12,
  "starting_score": 300,
  "repeat_multiplier_logic": {
    "1-2": 1,
    "3-4": 2,
    "5-6": 3,
    "7+": 3
  },
  "sample_registrations": [
    "MH31AB1234",
    "UP32CD5678",
    "DL8CAF9012",
    "KA01MN3456",
    "TN09GH1122",
    "RJ14KL7788",
    "GJ05QW3344",
    "AP39ZX5566",
    "HR26TT9090",
    "WB20LM4433",
    "MP09RS7711"
  ]
}
```

## Recommendation For The Other App

Mirror these exact records and keep these three things aligned:

- the registration numbers shown in quick samples
- the vehicle records and violations
- the 12-month repeat-multiplier scoring logic

If the other app should match this app exactly, either:

- add `HR26TT9090` to the dataset there too, or
- remove it from the quick-sample list in both apps
