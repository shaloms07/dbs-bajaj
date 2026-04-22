# Driver Behaviour Score (DBS)

## 8. Driver Behaviour Score — Structure and Methodology

### 8.1 Score Architecture

| Parameter | Value |
|----------|------|
| Score Range | 300 (no violations) → 0 (highest risk) |
| Starting Score | 300 (for all vehicles, including new ones) |
| Assessment Window | Last 12 months |
| Recalculation | At each insurance renewal |
| Data Source (Phase 1) | MOCK DATA |

---

### 8.2 Offence Classification

| Code | Offence Cluster | Points Deducted |
|------|---------------|----------------|
| THZ1 | Drunk Driving | 100 |
| THZ2 | Dangerous / Reckless Driving | 90 |
| THZ3 | Disobeying Police / Authority | 90 |
| THZ4 | Overspeeding / Racing | 80 |
| THZ5 | Driving without Licence / Insurance | 70 |
| THZ6 | Wrong Lane / Wrong Side Driving | 60 |
| THZ7 | Hazardous Goods Violation | 50 |
| THZ8 | Traffic Signal Violations | 50 |
| THZ9 | Overloading | 40 |
| THZ10 | Safety Violations (Helmet / Seatbelt) | 30 |
| THZ11 | Vehicle Modifications | 20 |
| THZ12 | Wrong Parking | 10 |

---

### 8.3 Score Calculation

DBS Score = 300 − Σ (Offence Points × Repeat Multiplier)  
Minimum Score = 0

#### Repeat Multiplier Logic

| Instance of Same Offence (within 12 months) | Multiplier |
|-------------------------------------------|-----------|
| 1st – 2nd instance | 1× |
| 3rd – 4th instance | 2× |
| 5th – 6th instance | 3× |
| 7th instance and beyond | 3x |

Notes:
- All challans within the 12-month window are considered  
- Multiple violations in a single event are counted individually  
- Lower score = higher risk  

---

## 9. Premium Structure — Discounts and Loadings

### Premium Adjustment Table

| DBS Score Band | Category | Premium Adjustment | Description |
|---------------|---------|-------------------|------------|
| 285 – 300 | Exemplary | −20% Discount | Consistent safe driver |
| 270 – 284 | Responsible | −10% Discount | Minor isolated lapse |
| 240 – 269 | Average | +25% Loading | Occasional violations |
| 210 – 239 | Marginal | +50% Loading | Moderate violations |
| 180 – 209 | At Risk | +75% Loading | Repeated offences |
| 150 – 179 | High Risk | +100% Loading | Frequent violations |
| 120 – 149 | Serious Risk | +125% Loading | Serious pattern |
| 90 – 119 | Chronic Violator | +150% Loading | Chronic offender |
| 60 – 89 | Habitual Offender | +175% Loading | Habitual risk profile |
| Below 60 | Extreme Risk | +200% (Cap) | Maximum loading applied |

---

### Key Rules

- Applies only to Motor Third Party (TP) premium
- Base TP premium (from MoRTH) remains unchanged
- Adjustments applied at renewal
- Maximum cap: +200% loading
- Ensures:
  - Consumer protection
  - Strong deterrence for risky drivers

### Vehicle Classification based on Engine and violation model support
const violationModel = [
        {
          code: "THZ 1",
          name: "Drunk Driving",
          points: 100,
          keywords: [
            "drunk",
            "alcohol",
            "intoxicated",
            "influence of alcohol",
            "drugs",
          ],
        },

        {
          code: "THZ 2",
          name: "Dangerous Driving",
          points: 90,
          keywords: [
            "jumping red light",
            "signal jump",
            "red light",
            "violating stop sign",
            "stop sign",
            "handheld",
            "mobile phone",
            "texting",
            "overtaking",
            "passing vehicle",
            "against traffic",
            "wrong flow",
            "dangerous driving",
            "reckless",
            "mentally unfit",
            "physically unfit",
          ],
        },

        {
          code: "THZ 3",
          name: "Disobeying Police",
          points: 90,
          keywords: [
            "disobey police",
            "misbehavior",
            "police officer",
            "withholding information",
            "refused police",
          ],
        },

        {
          code: "THZ 4",
          name: "Over Speeding",
          points: 80,
          keywords: [
            "overspeed",
            "over speeding",
            "speed limit",
            "racing",
            "above permitted speed",
            "without speed governor",
          ],
        },

        {
          code: "THZ 5",
          name: "Driving Without License/Insurance/PUCC",
          points: 70,
          keywords: [
            "without license",
            "no license",
            "without insurance",
            "expired insurance",
            "disqualified",
            "juvenile",
            "unauthorized person",
            "without pucc",
            "no pucc",
          ],
        },

        {
          code: "THZ 6",
          name: "Wrong Lane / No Entry",
          points: 60,
          keywords: [
            "wrong lane",
            "proper lane",
            "foot path",
            "footpath",
            "no entry",
            "nmv lane",
          ],
        },

        {
          code: "THZ 7",
          name: "Hazardous Goods Carriage",
          points: 50,
          keywords: [
            "hazardous goods",
            "dangerous goods",
            "carriage by road act",
            "transport dangerous goods",
          ],
        },

        {
          code: "THZ 8",
          name: "Traffic Signs Violation",
          points: 50,
          keywords: ["yellow line", "mandatory sign", "traffic sign"],
        },

        {
          code: "THZ 9",
          name: "Overloading",
          points: 40,
          keywords: [
            "overloading",
            "extra passenger",
            "weight limit",
            "high load",
            "long load",
            "extra passenger on driver seat",
            "two wheeler overloading",
          ],
        },

        {
          code: "THZ 10",
          name: "Safety Measures",
          points: 30,
          keywords: [
            "without helmet",
            "helmet",
            "seat belt",
            "seatbelt",
            "child restraint",
            "unsafe vehicle",
            "unfit vehicle",
          ],
        },

        {
          code: "THZ 11",
          name: "Vehicle Modification",
          points: 20,
          keywords: [
            "vehicle modification",
            "retro fitting",
            "modified silencer",
            "pressure horn",
            "rupd",
            "lupd",
          ],
        },

        {
          code: "THZ 12",
          name: "Wrong Parking",
          points: 10,
          keywords: [
            "wrong parking",
            "improper parking",
            "obstructive parking",
            "picking passenger without stand",
          ],
        },
      ];

 const tpPremiumData = {
        private_car: [
          { cc: "0-1000", premium: 2094 },
          { cc: "1000-1500", premium: 3416 },
          { cc: "1500+", premium: 7897 },
        ],
        two_wheeler: [
          { cc: "0-75", premium: 538 },
          { cc: "75-150", premium: 714 },
          { cc: "150-350", premium: 1366 },
          { cc: "350+", premium: 2804 },
        ],
        goods_vehicle_gvw: [
          { gvw: "0-7500", premium: 16049 },
          { gvw: "7500-12000", premium: 27000 },
          { gvw: "12000-20000", premium: 35313 },
          { gvw: "20000-25000", premium: 43804 },
          { gvw: "25000-30000", premium: 49304 },
          { gvw: "30000+", premium: 52104 },
        ],
        passenger_vehicle: {
          public_service: [
            { type: "3-wheeler (passenger)", premium_per_seat: 1390 },
            { type: "Bus", premium_driver: 10239, premium_per_seat: 873 },
          ],
          private_service: [
            { type: "Bus", premium_driver: 6946, premium_per_seat: 693 },
          ],
          educational: [
            { type: "Bus", premium_driver: 6697, premium_per_seat: 673 },
          ],
        },
      };


