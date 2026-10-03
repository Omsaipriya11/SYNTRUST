import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Gauge,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  Server,
  ShieldCheck,
  TrainFront,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import "./App.css";
import {
  getScenarioData,
  type SensorDataPoint,
} from "./data/syntrustData";

type SensorStatus = "healthy" | "warning" | "critical";

type ScenarioId =
  | "normal"
  | "speed"
  | "gps"
  | "braking"
  | "drift"
  | "coordinated";

type UserRole = "operator" | "admin";

type EvidenceState = "SUPPORTED" | "CONFLICT" | "LIMITED";

type AccessRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

interface Sensor {
  name: string;
  value: string;
  unit: string;
  status: SensorStatus;
  trust: number;
}

interface Scenario {
  id: ScenarioId;
  name: string;
  integrity: number;
  status: string;
  statusType: SensorStatus;
  description: string;
  evidence: string;
  speed: string;
  position: string;
  sensors: Sensor[];
  chartMain: string;
  chartReference: string;
}

interface EvidenceCheck {
  label: string;
  detail: string;
  state: EvidenceState;
}

interface AccessRequest {
  id: string;
  name: string;
  role: string;
  operatorId: string;
  time: string;
  status: AccessRequestStatus;
}

const scenarios: Scenario[] = [
  {
    id: "normal",
    name: "Normal Operation",
    integrity: 87,
    status: "NORMAL",
    statusType: "healthy",
    description:
      "All sensor streams are behaving consistently.",
    evidence:
      "Speed, GPS-derived movement and wheel RPM agree, with no abnormal brake or route behaviour.",
    speed: "78 km/h",
    position: "13.08° N",
    sensors: [
      {
        name: "Speed",
        value: "78",
        unit: "km/h",
        status: "healthy",
        trust: 91,
      },
      {
        name: "GPS",
        value: "13.0827",
        unit: "Lat",
        status: "healthy",
        trust: 94,
      },
      {
        name: "Wheel RPM",
        value: "520",
        unit: "RPM",
        status: "healthy",
        trust: 89,
      },
      {
        name: "Brake Pressure",
        value: "12.4",
        unit: "bar",
        status: "healthy",
        trust: 87,
      },
      {
        name: "Motor Current",
        value: "146",
        unit: "A",
        status: "healthy",
        trust: 82,
      },
    ],
    chartMain:
      "0,145 70,135 140,140 210,110 280,120 350,95 420,105 490,85 560,92 630,65 700,72",
    chartReference:
      "0,165 70,158 140,160 210,150 280,155 350,142 420,146 490,130 560,138 630,120 700,125",
  },
  {
    id: "speed",
    name: "Speed Manipulation",
    integrity: 41,
    status: "POTENTIAL MANIPULATION",
    statusType: "critical",
    description:
      "Speed sensor reports a value inconsistent with independent evidence.",
    evidence:
      "Speed reports 22 km/h while GPS-derived movement and wheel RPM indicate significantly higher speed.",
    speed: "22 km/h",
    position: "13.08° N",
    sensors: [
      {
        name: "Speed",
        value: "22",
        unit: "km/h",
        status: "critical",
        trust: 24,
      },
      {
        name: "GPS",
        value: "13.0841",
        unit: "Lat",
        status: "healthy",
        trust: 94,
      },
      {
        name: "Wheel RPM",
        value: "538",
        unit: "RPM",
        status: "healthy",
        trust: 89,
      },
      {
        name: "Brake Pressure",
        value: "12.1",
        unit: "bar",
        status: "healthy",
        trust: 86,
      },
      {
        name: "Motor Current",
        value: "149",
        unit: "A",
        status: "healthy",
        trust: 81,
      },
    ],
    chartMain:
      "0,140 70,138 140,136 210,132 280,130 350,178 420,184 490,190 560,193 630,198 700,202",
    chartReference:
      "0,160 70,158 140,156 210,150 280,145 350,110 420,100 490,92 560,85 630,82 700,78",
  },
  {
    id: "gps",
    name: "GPS Manipulation",
    integrity: 48,
    status: "POTENTIAL MANIPULATION",
    statusType: "critical",
    description:
      "GPS position deviates from expected railway movement.",
    evidence:
      "GPS position jumps unexpectedly while speed and wheel RPM continue to agree, creating a route-continuity conflict.",
    speed: "79 km/h",
    position: "13.1628° N",
    sensors: [
      {
        name: "Speed",
        value: "79",
        unit: "km/h",
        status: "healthy",
        trust: 91,
      },
      {
        name: "GPS",
        value: "13.1628",
        unit: "Lat",
        status: "critical",
        trust: 28,
      },
      {
        name: "Wheel RPM",
        value: "525",
        unit: "RPM",
        status: "healthy",
        trust: 89,
      },
      {
        name: "Brake Pressure",
        value: "12.3",
        unit: "bar",
        status: "healthy",
        trust: 87,
      },
      {
        name: "Motor Current",
        value: "147",
        unit: "A",
        status: "healthy",
        trust: 82,
      },
    ],
    chartMain:
      "0,145 70,138 140,142 210,120 280,118 350,105 420,110 490,94 560,100 630,88 700,92",
    chartReference:
      "0,165 70,158 140,160 210,150 280,154 350,142 420,145 490,134 560,138 630,130 700,125",
  },
  {
    id: "braking",
    name: "Genuine Braking",
    integrity: 82,
    status: "GENUINE PHYSICAL EVENT",
    statusType: "warning",
    description:
      "Sensor changes match a physically expected braking event.",
    evidence:
      "Speed and wheel RPM decrease together, brake pressure rises, and GPS follows the train's movement.",
    speed: "34 km/h",
    position: "13.0912° N",
    sensors: [
      {
        name: "Speed",
        value: "34",
        unit: "km/h",
        status: "warning",
        trust: 89,
      },
      {
        name: "GPS",
        value: "13.0912",
        unit: "Lat",
        status: "healthy",
        trust: 93,
      },
      {
        name: "Wheel RPM",
        value: "226",
        unit: "RPM",
        status: "warning",
        trust: 88,
      },
      {
        name: "Brake Pressure",
        value: "28.7",
        unit: "bar",
        status: "warning",
        trust: 91,
      },
      {
        name: "Motor Current",
        value: "72",
        unit: "A",
        status: "healthy",
        trust: 84,
      },
    ],
    chartMain:
      "0,70 70,78 140,85 210,100 280,115 350,135 420,150 490,168 560,180 630,193 700,205",
    chartReference:
      "0,75 70,82 140,90 210,105 280,120 350,138 420,152 490,170 560,181 630,194 700,205",
  },
  {
    id: "drift",
    name: "Sensor Drift",
    integrity: 59,
    status: "POTENTIAL MANIPULATION",
    statusType: "warning",
    description:
      "A sensor gradually diverges from independent measurements.",
    evidence:
      "Speed gradually drifts downward while GPS and wheel RPM remain comparatively stable; the persistent trend is more concerning than a single sample.",
    speed: "64 km/h",
    position: "13.1044° N",
    sensors: [
      {
        name: "Speed",
        value: "64",
        unit: "km/h",
        status: "warning",
        trust: 48,
      },
      {
        name: "GPS",
        value: "13.1044",
        unit: "Lat",
        status: "healthy",
        trust: 92,
      },
      {
        name: "Wheel RPM",
        value: "505",
        unit: "RPM",
        status: "healthy",
        trust: 88,
      },
      {
        name: "Brake Pressure",
        value: "12.6",
        unit: "bar",
        status: "healthy",
        trust: 87,
      },
      {
        name: "Motor Current",
        value: "139",
        unit: "A",
        status: "healthy",
        trust: 81,
      },
    ],
    chartMain:
      "0,100 70,108 140,115 210,125 280,137 350,148 420,160 490,170 560,182 630,191 700,200",
    chartReference:
      "0,100 70,101 140,102 210,103 280,105 350,105 420,107 490,108 560,110 630,112 700,115",
  },
  {
    id: "coordinated",
    name: "Coordinated Multi-Sensor Attack",
    integrity: 36,
    status: "INTEGRITY UNCERTAIN",
    statusType: "critical",
    description:
      "Multiple streams appear mutually consistent, but independent evidence is insufficient.",
    evidence:
      "Several sensors agree with each other. That agreement cannot establish truth when the same evidence group may be manipulated; SYNTRUST therefore reports integrity uncertainty instead of declaring NORMAL.",
    speed: "61 km/h",
    position: "13.1189° N",
    sensors: [
      {
        name: "Speed",
        value: "61",
        unit: "km/h",
        status: "warning",
        trust: 43,
      },
      {
        name: "GPS",
        value: "13.1189",
        unit: "Lat",
        status: "warning",
        trust: 46,
      },
      {
        name: "Wheel RPM",
        value: "410",
        unit: "RPM",
        status: "warning",
        trust: 51,
      },
      {
        name: "Brake Pressure",
        value: "15.8",
        unit: "bar",
        status: "warning",
        trust: 63,
      },
      {
        name: "Motor Current",
        value: "118",
        unit: "A",
        status: "warning",
        trust: 58,
      },
    ],
    chartMain:
      "0,140 70,135 140,130 210,125 280,120 350,115 420,110 490,105 560,100 630,95 700,90",
    chartReference:
      "0,165 70,160 140,156 210,152 280,148 350,144 420,140 490,136 560,132 630,128 700,124",
  },
];

const initialAccessRequests: AccessRequest[] = [
  {
    id: "AR-1042",
    name: "Ravi Kumar",
    role: "Control Room Operator",
    operatorId: "OP-1042",
    time: "2 min ago",
    status: "PENDING",
  },
  {
    id: "AR-1043",
    name: "Ananya S",
    role: "Maintenance Operator",
    operatorId: "OP-1043",
    time: "8 min ago",
    status: "PENDING",
  },
];

/* -------------------------------------------------------
   DATASET → UI SCENARIO MAPPING
------------------------------------------------------- */

const datasetScenarioMap: Record<
  ScenarioId,
  string
> = {
  normal: "normal",
  speed: "speed_attack",
  gps: "gps_attack",
  braking: "braking",
  drift: "drift",
  coordinated: "coordinated",
};

/* -------------------------------------------------------
   EXISTING EVIDENCE ENGINE
------------------------------------------------------- */

function evidenceFor(
  id: ScenarioId,
): EvidenceCheck[] {
  const map: Record<
    ScenarioId,
    EvidenceCheck[]
  > = {
    normal: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Speed, GPS-derived movement and wheel RPM agree.",
        state: "SUPPORTED",
      },
      {
        label: "Physical consistency",
        detail:
          "Brake pressure and motor current are plausible for the observed movement.",
        state: "SUPPORTED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "No abrupt jump or persistent divergence is visible.",
        state: "SUPPORTED",
      },
      {
        label: "Independent evidence",
        detail:
          "Multiple independent signals support the same operating state.",
        state: "SUPPORTED",
      },
    ],

    speed: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Reported speed conflicts with GPS-derived movement and wheel RPM.",
        state: "CONFLICT",
      },
      {
        label: "Physical consistency",
        detail:
          "Low reported speed is not supported by wheel and movement evidence.",
        state: "CONFLICT",
      },
      {
        label: "Temporal behaviour",
        detail:
          "Speed trace shows a sharp discontinuity against the reference trend.",
        state: "CONFLICT",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS and wheel RPM provide independent support for the anomaly.",
        state: "SUPPORTED",
      },
    ],

    gps: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Speed and wheel RPM agree while GPS diverges.",
        state: "CONFLICT",
      },
      {
        label: "Physical consistency",
        detail:
          "Observed movement does not support the sudden GPS position change.",
        state: "CONFLICT",
      },
      {
        label: "Temporal behaviour",
        detail:
          "GPS contains an unexpected position jump.",
        state: "CONFLICT",
      },
      {
        label: "Independent evidence",
        detail:
          "Speed and wheel RPM provide corroborating movement evidence.",
        state: "SUPPORTED",
      },
    ],

    braking: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Speed and wheel RPM decrease together as brake pressure rises.",
        state: "SUPPORTED",
      },
      {
        label: "Physical consistency",
        detail:
          "The sensor pattern matches a braking response.",
        state: "SUPPORTED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "Changes occur as a coherent transition rather than a sudden isolated fault.",
        state: "SUPPORTED",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS continues along the expected route during deceleration.",
        state: "SUPPORTED",
      },
    ],

    drift: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Speed slowly separates from otherwise stable movement evidence.",
        state: "CONFLICT",
      },
      {
        label: "Physical consistency",
        detail:
          "Brake and motor signals do not explain the persistent speed drift.",
        state: "LIMITED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "The divergence grows gradually across the observation window.",
        state: "CONFLICT",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS and wheel RPM provide a stable reference for comparison.",
        state: "SUPPORTED",
      },
    ],

    coordinated: [
      {
        label: "Cross-sensor consistency",
        detail:
          "Multiple streams agree, but they may share the same manipulated narrative.",
        state: "LIMITED",
      },
      {
        label: "Physical consistency",
        detail:
          "Available signals do not provide a sufficiently independent physical reference.",
        state: "LIMITED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "The coordinated pattern can appear plausible over time.",
        state: "LIMITED",
      },
      {
        label: "Independent evidence",
        detail:
          "No sufficiently independent reference is available to establish truth.",
        state: "LIMITED",
      },
    ],
  };

  return map[id];
}

/* -------------------------------------------------------
   REPLAY HELPERS
------------------------------------------------------- */

function clamp(
  value: number,
  min = 0,
  max = 100,
) {
  return Math.max(min, Math.min(max, value));
}

function getReplayTrust(
  scenarioId: ScenarioId,
  point: SensorDataPoint,
): Record<string, number> {
  const speedError = Math.abs(
    point.speed_kmh -
      point.ground_truth_speed_kmh,
  );

  const gpsError = Math.abs(
    point.gps_speed_kmh -
      point.ground_truth_speed_kmh,
  );

  const wheelExpectedSpeed =
    point.wheel_rpm * 0.145;

  const wheelError = Math.abs(
    wheelExpectedSpeed -
      point.ground_truth_speed_kmh,
  );

  const speedTrust = clamp(
    100 - speedError * 4.2,
  );

  const gpsTrust =
    scenarioId === "coordinated"
      ? 48
      : clamp(100 - gpsError * 4.5);

  const wheelTrust =
    scenarioId === "coordinated"
      ? 52
      : clamp(100 - wheelError * 1.8);

  const brakeTrust =
    scenarioId === "braking"
      ? clamp(
          88 +
            Math.min(
              10,
              Math.abs(
                point.brake_pressure_bar - 20,
              ) / 2,
            ),
        )
      : clamp(
          90 -
            Math.max(
              0,
              point.brake_pressure_bar - 18,
            ) *
              1.5,
        );

  const motorTrust =
    scenarioId === "coordinated"
      ? 58
      : clamp(
          88 -
            Math.abs(
              point.motor_current_a - 145,
            ) *
              0.55,
        );

  return {
    Speed: Math.round(speedTrust),
    GPS: Math.round(gpsTrust),
    "Wheel RPM": Math.round(wheelTrust),
    "Brake Pressure": Math.round(brakeTrust),
    "Motor Current": Math.round(motorTrust),
  };
}

function getReplayIntegrity(
  scenarioId: ScenarioId,
  point: SensorDataPoint,
): number {
  const speedError = Math.abs(
    point.speed_kmh -
      point.ground_truth_speed_kmh,
  );

  const gpsError = Math.abs(
    point.gps_speed_kmh -
      point.ground_truth_speed_kmh,
  );

  if (scenarioId === "normal") {
    return clamp(
      96 -
        speedError * 2 -
        gpsError * 1.2,
      82,
      96,
    );
  }

  if (scenarioId === "speed") {
    return clamp(
      75 - speedError * 1.7,
      20,
      48,
    );
  }

  if (scenarioId === "gps") {
    return clamp(
      78 - gpsError * 1.8,
      25,
      52,
    );
  }

  if (scenarioId === "braking") {
    const brakingStrength =
      point.brake_pressure_bar >= 20;

    if (brakingStrength) {
      return Math.round(
        clamp(
          88 -
            Math.abs(
              point.speed_kmh -
                point.ground_truth_speed_kmh,
            ) *
              1.1,
          76,
          91,
        ),
      );
    }

    return 84;
  }

  if (scenarioId === "drift") {
    return clamp(
      88 - speedError * 2.4,
      38,
      88,
    );
  }

  if (scenarioId === "coordinated") {
    return clamp(
      43 -
        Math.max(
          0,
          point.timestamp_s - 12,
        ) *
          0.15,
      32,
      43,
    );
  }

  return 70;
}

function getReplayStatus(
  point: SensorDataPoint,
): {
  status: string;
  statusType: SensorStatus;
  description: string;
  evidence: string;
} {
  switch (point.expected_decision) {
    case "POTENTIAL MANIPULATION":
      return {
        status: "POTENTIAL MANIPULATION",
        statusType: "critical",
        description:
          "Sensor evidence is diverging from the independent reference.",
        evidence:
          "The observed telemetry conflicts with independent movement evidence, so SYNTRUST flags a potential manipulation pattern.",
      };

    case "GENUINE PHYSICAL EVENT":
      return {
        status: "GENUINE PHYSICAL EVENT",
        statusType: "warning",
        description:
          "Sensor changes follow a physically coherent event.",
        evidence:
          "Speed, wheel RPM, brake pressure and movement change together in a pattern consistent with a genuine physical event.",
      };

    case "INTEGRITY UNCERTAIN":
      return {
        status: "INTEGRITY UNCERTAIN",
        statusType: "critical",
        description:
          "Sensors appear consistent, but independent evidence is insufficient.",
        evidence:
          "Multiple sensor streams agree, but there is no sufficiently independent reference to establish whether that agreement represents truth.",
      };

    default:
      return {
        status: "NORMAL",
        statusType: "healthy",
        description:
          "Sensor streams remain consistent with the reference.",
        evidence:
          "Observed movement, GPS-derived speed and wheel behaviour remain consistent with the available reference.",
      };
  }
}

/* -------------------------------------------------------
   REPLAY CHART
------------------------------------------------------- */

function getReplayChartPoints(
  data: SensorDataPoint[],
  replayIndex: number,
  field:
    | "speed_kmh"
    | "ground_truth_speed_kmh",
): string {
  const visible = data.slice(
    0,
    Math.max(1, replayIndex + 1),
  );

  if (visible.length === 1) {
    return "0,125";
  }

  /*
   * Use one shared scale for BOTH observed and
   * reference values so the two lines remain
   * visually comparable during replay.
   */
  const allValues = visible.flatMap(
    (point) => [
      point.speed_kmh,
      point.ground_truth_speed_kmh,
    ],
  );

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const range =
    maxValue - minValue === 0
      ? 1
      : maxValue - minValue;

  return visible
    .map((point, index) => {
      const x =
        (index /
          Math.max(
            1,
            data.length - 1,
          )) *
        700;

      const normalized =
        (point[field] - minValue) /
        range;

      const y =
        210 - normalized * 145;

      return `${x.toFixed(
        1,
      )},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getReplayEvidence(
  scenarioId: ScenarioId,
  point: SensorDataPoint,
  replayIndex: number,
): EvidenceCheck[] {
  const base = evidenceFor(
    scenarioId,
  );

  if (scenarioId === "normal") {
    return base.map((check) => ({
      ...check,
      detail:
        replayIndex < 5
          ? check.detail
          : `${check.detail} Replay point ${
              replayIndex + 1
            }/30 remains within the expected range.`,
    }));
  }

  if (scenarioId === "speed") {
    const gap = Math.abs(
      point.speed_kmh -
        point.ground_truth_speed_kmh,
    );

    return [
      {
        label: "Cross-sensor consistency",
        detail: `Reported speed ${point.speed_kmh.toFixed(
          1,
        )} km/h conflicts with independent movement evidence near ${point.ground_truth_speed_kmh.toFixed(
          1,
        )} km/h.`,
        state:
          gap > 20
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Physical consistency",
        detail:
          "Wheel RPM and GPS-derived movement do not support the reported speed.",
        state:
          gap > 20
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Temporal behaviour",
        detail: `Replay is evaluating point ${
          replayIndex + 1
        }/30 against the independent reference.`,
        state:
          replayIndex >= 4
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS and wheel RPM provide independent movement support.",
        state: "SUPPORTED",
      },
    ];
  }

  if (scenarioId === "gps") {
    const gap = Math.abs(
      point.gps_speed_kmh -
        point.ground_truth_speed_kmh,
    );

    return [
      {
        label: "Cross-sensor consistency",
        detail:
          "Speed and wheel behaviour remain closer to the reference while GPS-derived speed diverges.",
        state:
          gap > 20
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Physical consistency",
        detail: `GPS-derived speed is ${point.gps_speed_kmh.toFixed(
          1,
        )} km/h versus reference ${point.ground_truth_speed_kmh.toFixed(
          1,
        )} km/h.`,
        state:
          gap > 20
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "The replay tracks the continuing GPS divergence over time.",
        state:
          replayIndex >= 4
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Independent evidence",
        detail:
          "Speed and wheel RPM provide corroborating movement evidence.",
        state: "SUPPORTED",
      },
    ];
  }

  if (scenarioId === "braking") {
    const braking =
      point.brake_pressure_bar >= 20;

    return [
      {
        label: "Cross-sensor consistency",
        detail: braking
          ? "Speed and wheel RPM are decreasing together as brake pressure rises."
          : "Sensor streams remain aligned before the braking transition.",
        state: "SUPPORTED",
      },
      {
        label: "Physical consistency",
        detail: braking
          ? `Brake pressure has increased to ${point.brake_pressure_bar.toFixed(
              1,
            )} bar while speed changes coherently.`
          : "No contradictory physical response is visible at this point.",
        state: "SUPPORTED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "The replay shows a continuous transition rather than an isolated sensor fault.",
        state: "SUPPORTED",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS-derived movement continues to follow the physical event.",
        state: "SUPPORTED",
      },
    ];
  }

  if (scenarioId === "drift") {
    const gap = Math.abs(
      point.speed_kmh -
        point.ground_truth_speed_kmh,
    );

    return [
      {
        label: "Cross-sensor consistency",
        detail: `Speed is ${gap.toFixed(
          1,
        )} km/h away from the reference at this replay point.`,
        state:
          gap > 8
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Physical consistency",
        detail:
          "Brake and motor signals do not explain the persistent downward speed trend.",
        state:
          gap > 5
            ? "LIMITED"
            : "SUPPORTED",
      },
      {
        label: "Temporal behaviour",
        detail:
          "The divergence becomes more visible as replay progresses.",
        state:
          replayIndex >= 10
            ? "CONFLICT"
            : "LIMITED",
      },
      {
        label: "Independent evidence",
        detail:
          "GPS and ground-truth reference continue to provide comparison evidence.",
        state: "SUPPORTED",
      },
    ];
  }

  return [
    {
      label: "Cross-sensor consistency",
      detail:
        "Multiple streams agree with each other, but agreement alone does not establish truth.",
      state: "LIMITED",
    },
    {
      label: "Physical consistency",
      detail:
        "Available streams do not provide a sufficiently independent physical reference.",
      state: "LIMITED",
    },
    {
      label: "Temporal behaviour",
      detail: `Replay point ${
        replayIndex + 1
      }/30 remains plausible as a coordinated pattern.`,
      state: "LIMITED",
    },
    {
      label: "Independent evidence",
      detail:
        point.independent_reference_available
          ? "Independent reference is available."
          : "No sufficiently independent reference is available for this incident.",
      state: "LIMITED",
    },
  ];
}

/* -------------------------------------------------------
   BUILD DATASET-DRIVEN SCENARIO
------------------------------------------------------- */

function buildReplayScenario(
  baseScenario: Scenario,
  point: SensorDataPoint,
  replayIndex: number,
  replayData: SensorDataPoint[],
): Scenario {
  const trust = getReplayTrust(
    baseScenario.id,
    point,
  );

  const replayIntegrity = Math.round(
    getReplayIntegrity(
      baseScenario.id,
      point,
    ),
  );

  const replayStatus =
    getReplayStatus(point);

  const makeStatus = (
    value: number,
    normalLimit: number,
    criticalLimit: number,
  ): SensorStatus => {
    if (value >= normalLimit)
      return "healthy";

    if (value >= criticalLimit)
      return "warning";

    return "critical";
  };

  return {
    ...baseScenario,

    integrity: replayIntegrity,

    status: replayStatus.status,

    statusType: replayStatus.statusType,

    description:
      replayStatus.description,

    evidence: replayStatus.evidence,

    speed: `${point.speed_kmh.toFixed(
      1,
    )} km/h`,

    position: `${point.latitude.toFixed(
      4,
    )}° N`,

    sensors: [
      {
        name: "Speed",
        value: point.speed_kmh.toFixed(
          1,
        ),
        unit: "km/h",
        status: makeStatus(
          trust.Speed,
          75,
          45,
        ),
        trust: trust.Speed,
      },
      {
        name: "GPS",
        value: point.latitude.toFixed(
          4,
        ),
        unit: "Lat",
        status: makeStatus(
          trust.GPS,
          75,
          45,
        ),
        trust: trust.GPS,
      },
      {
        name: "Wheel RPM",
        value: point.wheel_rpm.toFixed(
          0,
        ),
        unit: "RPM",
        status: makeStatus(
          trust["Wheel RPM"],
          75,
          45,
        ),
        trust: trust["Wheel RPM"],
      },
      {
        name: "Brake Pressure",
        value:
          point.brake_pressure_bar.toFixed(
            1,
          ),
        unit: "bar",
        status: makeStatus(
          trust["Brake Pressure"],
          75,
          45,
        ),
        trust:
          trust["Brake Pressure"],
      },
      {
        name: "Motor Current",
        value:
          point.motor_current_a.toFixed(
            1,
          ),
        unit: "A",
        status: makeStatus(
          trust["Motor Current"],
          75,
          45,
        ),
        trust:
          trust["Motor Current"],
      },
    ],

    chartMain:
      getReplayChartPoints(
        replayData,
        replayIndex,
        "speed_kmh",
      ),

    chartReference:
      getReplayChartPoints(
        replayData,
        replayIndex,
        "ground_truth_speed_kmh",
      ),
  };
}

/* -------------------------------------------------------
   APP
------------------------------------------------------- */

function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loggedInRole, setLoggedInRole] =
    useState<UserRole | null>(null);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState<UserRole>("operator");

  const [loginError, setLoginError] =
    useState("");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [
    selectedScenario,
    setSelectedScenario,
  ] = useState<ScenarioId>("normal");

  const [
    activeScenario,
    setActiveScenario,
  ] = useState<ScenarioId>("normal");

  const [
    accessRequests,
    setAccessRequests,
  ] = useState<AccessRequest[]>(
    initialAccessRequests,
  );

  /* ---------------------------------------------------
     REPLAY STATE
  --------------------------------------------------- */

  const [isReplaying, setIsReplaying] =
    useState(false);

  const [replayIndex, setReplayIndex] =
    useState(0);

  const replayData = getScenarioData(
    datasetScenarioMap[selectedScenario],
  );

  const activeReplayData =
    getScenarioData(
      datasetScenarioMap[activeScenario],
    );

  const replayPoint =
    isReplaying
      ? activeReplayData[replayIndex]
      : undefined;

  const staticScenario =
    scenarios.find(
      (s) => s.id === activeScenario,
    ) ?? scenarios[0];

  const currentScenario =
    replayPoint
      ? buildReplayScenario(
          staticScenario,
          replayPoint,
          replayIndex,
          activeReplayData,
        )
      : staticScenario;

  const checks =
    replayPoint
      ? getReplayEvidence(
          activeScenario,
          replayPoint,
          replayIndex,
        )
      : evidenceFor(
          currentScenario.id,
        );

  const statusClass =
    currentScenario.statusType;

  /* ---------------------------------------------------
     REPLAY TIMER
  --------------------------------------------------- */

  useEffect(() => {
    if (
      !isReplaying ||
      activeReplayData.length === 0
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setReplayIndex((previous) =>
          Math.min(
            previous + 1,
            activeReplayData.length - 1,
          ),
        );
      }, 700);

    return () =>
      window.clearInterval(timer);
  }, [
    isReplaying,
    activeReplayData.length,
  ]);

  /* ---------------------------------------------------
     AUTOMATIC REPLAY STOP
  --------------------------------------------------- */

  useEffect(() => {
    if (
      isReplaying &&
      activeReplayData.length > 0 &&
      replayIndex >=
        activeReplayData.length - 1
    ) {
      const stopTimer =
        window.setTimeout(() => {
          setIsReplaying(false);
        }, 750);

      return () =>
        window.clearTimeout(stopTimer);
    }
  }, [
    isReplaying,
    replayIndex,
    activeReplayData.length,
  ]);

  const handleLogin = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (
      !username.trim() ||
      !password.trim()
    ) {
      setLoginError(
        "Enter username and password to continue.",
      );
      return;
    }

    setLoginError("");
    setLoggedInRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setLoggedInRole(null);
    setUsername("");
    setPassword("");
    setMobileMenu(false);
    setIsReplaying(false);
    setReplayIndex(0);
  };

  const runScenario = () => {
    setIsReplaying(false);
    setReplayIndex(0);
    setActiveScenario(
      selectedScenario,
    );
  };

  const startReplay = () => {
    if (replayData.length === 0) {
      return;
    }

    /*
     * Start directly instead of using a delayed
     * timeout. This avoids a stale replay starting
     * after the user changes scenario or stops it.
     */
    setActiveScenario(
      selectedScenario,
    );
    setReplayIndex(0);
    setIsReplaying(true);
  };

  const stopReplay = () => {
    setIsReplaying(false);
  };

  const handleScenarioSelect = (
    id: ScenarioId,
  ) => {
    setIsReplaying(false);
    setReplayIndex(0);
    setSelectedScenario(id);
  };

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setMobileMenu(false);
  };

  const decideRequest = (
    id: string,
    status: AccessRequestStatus,
  ) =>
    setAccessRequests((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );

  if (!isLoggedIn) {
    return (
      <LoginScreen
        role={role}
        setRole={setRole}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        error={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  if (loggedInRole === "admin") {
    return (
      <AdminScreen
        requests={accessRequests}
        onDecision={decideRequest}
        onLogout={logout}
      />
    );
  }

  return (
    <OperatorScreen
      currentScenario={currentScenario}
      selectedScenario={selectedScenario}
      setSelectedScenario={
        handleScenarioSelect
      }
      runScenario={runScenario}
      startReplay={startReplay}
      stopReplay={stopReplay}
      isReplaying={isReplaying}
      replayIndex={replayIndex}
      replayLength={
        activeReplayData.length
      }
      replayPoint={replayPoint}
      checks={checks}
      mobileMenu={mobileMenu}
      setMobileMenu={setMobileMenu}
      scrollTo={scrollTo}
      onLogout={logout}
      statusClass={statusClass}
    />
  );
}

/* -------------------------------------------------------
   LOGIN
------------------------------------------------------- */

function LoginScreen({
  role,
  setRole,
  username,
  setUsername,
  password,
  setPassword,
  error,
  onSubmit,
}: {
  role: UserRole;
  setRole: (r: UserRole) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div className="secure-login-page">
      <div className="login-grid" />

      <div className="secure-login-card">
        <div className="secure-login-brand">
          <div className="secure-brand-mark">
            <TrainFront size={28} />
          </div>

          <div>
            <strong>SYNTRUST</strong>

            <span>
              Sensors report. Evidence decides.
            </span>
          </div>
        </div>

        <div className="secure-login-title">
          <span>
            SECURE CONTROL ACCESS
          </span>

          <h1>System Login</h1>

          <p>
            Authorized personnel only. Choose
            your operational role.
          </p>
        </div>

        <form
          className="secure-login-form"
          onSubmit={onSubmit}
        >
          <label>
            Username

            <input
              className="secure-input"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
            />
          </label>

          <label>
            Password

            <input
              className="secure-input"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>

          <div className="role-label">
            ACCESS ROLE
          </div>

          <div className="secure-role-grid">
            <button
              type="button"
              className={`secure-role ${
                role === "operator"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setRole("operator")
              }
            >
              <Activity size={18} />

              <span>
                <strong>
                  Operator
                </strong>

                <small>
                  Monitor railway integrity
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`secure-role ${
                role === "admin"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setRole("admin")
              }
            >
              <LockKeyhole size={18} />

              <span>
                <strong>
                  Administrator
                </strong>

                <small>
                  Manage access & security
                </small>
              </span>
            </button>
          </div>

          {error && (
            <div className="login-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            className="secure-signin-button"
            type="submit"
          >
            <LockKeyhole size={17} />
            SIGN IN SECURELY
          </button>
        </form>

        <div className="secure-login-footer">
          <span>
            <span className="secure-dot" />
            SECURE ENVIRONMENT
          </span>

          <span>
            Monitoring System Ready
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   OPERATOR
------------------------------------------------------- */

function OperatorScreen({
  currentScenario,
  selectedScenario,
  setSelectedScenario,
  runScenario,
  startReplay,
  stopReplay,
  isReplaying,
  replayIndex,
  replayLength,
  replayPoint,
  checks,
  mobileMenu,
  setMobileMenu,
  scrollTo,
  onLogout,
  statusClass,
}: {
  currentScenario: Scenario;
  selectedScenario: ScenarioId;
  setSelectedScenario: (
    id: ScenarioId,
  ) => void;
  runScenario: () => void;
  startReplay: () => void;
  stopReplay: () => void;
  isReplaying: boolean;
  replayIndex: number;
  replayLength: number;
  replayPoint?: SensorDataPoint;
  checks: EvidenceCheck[];
  mobileMenu: boolean;
  setMobileMenu: (v: boolean) => void;
  scrollTo: (id: string) => void;
  onLogout: () => void;
  statusClass: SensorStatus;
}) {
  const replayProgress =
    replayLength > 0
      ? ((replayIndex + 1) /
          replayLength) *
        100
      : 0;

  const trainPosition =
    replayPoint
      ? Math.min(
          88,
          8 +
            (replayIndex /
              Math.max(
                1,
                replayLength - 1,
              )) *
              80,
        )
      : 48;

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          mobileMenu
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            <TrainFront size={24} />
          </div>

          <div>
            <h1>SYNTRUST</h1>

            <span>
              Sensors report. Evidence decides.
            </span>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() =>
              scrollTo("control-center")
            }
          >
            <Activity size={18} />
            Control Center
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollTo("sensor-monitor")
            }
          >
            <Gauge size={18} />
            Sensor Monitor
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollTo(
                "integrity-analysis",
              )
            }
          >
            <ShieldCheck size={18} />
            Integrity Analysis
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollTo("alert-center")
            }
          >
            <Bell size={18} />
            Alert Center
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="operator-card">
            <div className="operator-avatar">
              <CircleUserRound size={20} />
            </div>

            <div>
              <strong>
                Control Operator
              </strong>

              <span>OPR-204</span>
            </div>

            <span className="online-dot" />
          </div>

          <button
            className="operator-logout"
            onClick={onLogout}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header
          className="topbar"
          id="control-center"
        >
          <button
            className="mobile-menu"
            onClick={() =>
              setMobileMenu(true)
            }
          >
            <Menu size={22} />
          </button>

          <div className="page-heading">
            <span>
              RAILWAY CONTROL CENTER
            </span>

            <h2>
              Train Integrity Monitor
            </h2>
          </div>

          <div className="topbar-right">
            <div className="system-online">
              <span />
              SYSTEM ONLINE
            </div>

            <div className="train-id">
              <TrainFront size={16} />
              TN-2047
            </div>
          </div>
        </header>

        <div className="dashboard">
          {/* KPI SECTION */}

          <section className="kpi-grid">
            <Kpi
              title="SYSTEM INTEGRITY"
              icon={
                <ShieldCheck size={17} />
              }
            >
              <div className="integrity-value">
                <strong>
                  {currentScenario.integrity}
                </strong>

                <span>/100</span>
              </div>

              <div className="progress-track">
                <div
                  className={`progress-fill ${statusClass}`}
                  style={{
                    width: `${currentScenario.integrity}%`,
                  }}
                />
              </div>

              <p>
                {currentScenario.integrity >=
                75
                  ? "Evidence is currently consistent."
                  : currentScenario.integrity >=
                      50
                    ? "Evidence requires closer review."
                    : "Independent evidence is currently limited."}
              </p>
            </Kpi>

            <Kpi
              title="CURRENT STATUS"
              icon={
                <Activity size={17} />
              }
            >
              <div
                className={`status-value ${statusClass}`}
              >
                <span className="status-dot" />
                {currentScenario.status}
              </div>

              <p>
                {currentScenario.description}
              </p>
            </Kpi>

            <Kpi
              title="ACTIVE SENSORS"
              icon={<Gauge size={17} />}
            >
              <div className="large-value">
                5/5
              </div>

              <p>
                All sensor streams available
              </p>
            </Kpi>

            <Kpi
              title="CURRENT SCENARIO"
              icon={
                <TrainFront size={17} />
              }
            >
              <div className="scenario-value">
                {currentScenario.name}
              </div>

              <p>
                {isReplaying
                  ? `Dataset replay • Point ${
                      replayIndex + 1
                    }/${replayLength}`
                  : "Controlled simulation"}
              </p>
            </Kpi>
          </section>

          {/* SENSOR MONITOR */}

          <section
            className="section-block"
            id="sensor-monitor"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  LIVE TELEMETRY
                </span>

                <h3>
                  Sensor Monitoring
                </h3>
              </div>

              <span className="live-indicator">
                <span />

                {isReplaying
                  ? "INCIDENT REPLAY"
                  : "LIVE SIMULATION"}
              </span>
            </div>

            <div className="sensor-grid">
              {currentScenario.sensors.map(
                (s) => (
                  <div
                    className="sensor-card"
                    key={s.name}
                  >
                    <div className="sensor-top">
                      <span>
                        {s.name}
                      </span>

                      <span
                        className={`sensor-status ${s.status}`}
                      >
                        <span />
                        {s.status}
                      </span>
                    </div>

                    <div className="sensor-value">
                      {s.value}

                      <small>
                        {s.unit}
                      </small>
                    </div>

                    <div className="sensor-bottom">
                      <span>
                        Sensor Trust
                      </span>

                      <strong>
                        {s.trust}/100
                      </strong>
                    </div>

                    <div className="mini-progress">
                      <div
                        className={s.status}
                        style={{
                          width: `${s.trust}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* MAIN GRID */}

          <section className="main-grid">
            <div className="panel graph-panel">
              <PanelHeading
                eyebrow="MULTI-SENSOR ANALYSIS"
                title="Sensor Behaviour"
                right={
                  isReplaying
                    ? `Replay ${
                        replayIndex + 1
                      }/${replayLength}`
                    : "Last 60 seconds"
                }
              />

              <div className="fake-chart">
                <div className="chart-y">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <svg
                    viewBox="0 0 700 250"
                    preserveAspectRatio="none"
                    className="chart-svg"
                  >
                    <polyline
                      points={
                        currentScenario.chartMain
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <polyline
                      points={
                        currentScenario.chartReference
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="7 7"
                      opacity=".45"
                    />
                  </svg>

                  <div className="chart-labels">
                    <span>−60s</span>
                    <span>−45s</span>
                    <span>−30s</span>
                    <span>−15s</span>
                    <span>NOW</span>
                  </div>
                </div>
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-speed" />
                  Observed behaviour
                </span>

                <span>
                  <i className="legend-reference" />
                  Reference
                </span>
              </div>
            </div>

            <div className="panel route-panel">
              <PanelHeading
                eyebrow="LOCATION"
                title="Railway Route"
                icon={
                  <MapPin size={19} />
                }
              />

              <div className="railway-map">
                <div className="map-grid" />

                <div className="route-line">
                  <span className="station station-1">
                    <i />
                    Chennai
                  </span>

                  <span className="station station-2">
                    <i />
                    Basin Bridge
                  </span>

                  <span className="station station-3">
                    <i />
                    Avadi
                  </span>

                  <span className="station station-4">
                    <i />
                    Tiruvallur
                  </span>

                  <div
                    className="train-marker"
                    style={{
                      left: `${trainPosition}%`,
                    }}
                  >
                    <TrainFront size={18} />
                  </div>
                </div>
              </div>

              <div className="route-footer">
                <div>
                  <span>TRAIN</span>

                  <strong>
                    TN-2047
                  </strong>
                </div>

                <div>
                  <span>SPEED</span>

                  <strong>
                    {currentScenario.speed}
                  </strong>
                </div>

                <div>
                  <span>POSITION</span>

                  <strong>
                    {currentScenario.position}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* LOWER GRID */}

          <section className="lower-grid">
            {/* SCENARIO SIMULATOR */}

            <div className="panel scenario-panel">
              <PanelHeading
                eyebrow="TEST ENVIRONMENT"
                title="Scenario Simulator"
              />

              <p className="panel-description">
                Select a controlled event and
                run it through the evidence
                engine.
              </p>

              <div className="scenario-options">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    className={`scenario-option ${
                      selectedScenario ===
                      s.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedScenario(
                        s.id,
                      )
                    }
                  >
                    <span className="scenario-radio" />

                    <span>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="scenario-action-row">
                <button
                  className="run-button"
                  onClick={runScenario}
                  disabled={isReplaying}
                >
                  RUN SCENARIO
                  <span>→</span>
                </button>

                <button
                  className={`replay-button ${
                    isReplaying
                      ? "stop"
                      : ""
                  }`}
                  onClick={
                    isReplaying
                      ? stopReplay
                      : startReplay
                  }
                >
                  {isReplaying
                    ? "STOP REPLAY"
                    : "REPLAY INCIDENT"}

                  <span>
                    {isReplaying
                      ? "■"
                      : "▶"}
                  </span>
                </button>
              </div>

              {isReplaying && (
                <div className="replay-status">
                  <div className="replay-status-header">
                    <div className="replay-status-title">
                      <span className="replay-live-dot" />
                      <span>
                        INCIDENT REPLAY
                      </span>
                    </div>

                    <div className="replay-point-count">
                      <strong>
                        {String(
                          replayIndex + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <span>
                        /{" "}
                        {String(
                          replayLength,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="replay-progress-track">
                    <div
                      className="replay-progress-fill"
                      style={{
                        width: `${replayProgress}%`,
                      }}
                    />
                  </div>

                  <div className="replay-data-grid">
                    <div className="replay-data-item">
                      <span>
                        DATASET TIME
                      </span>

                      <strong>
                        {replayPoint
                          ?.timestamp_s ??
                          0}
                        s
                      </strong>
                    </div>

                    <div className="replay-data-item">
                      <span>
                        EXPECTED DECISION
                      </span>

                      <strong>
                        {replayPoint
                          ?.expected_decision ??
                          "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TRUST */}

            <div
              className="panel trust-panel"
              id="integrity-analysis"
            >
              <PanelHeading
                eyebrow="TRUST ENGINE"
                title="Sensor Trust"
                icon={
                  <ShieldCheck size={19} />
                }
              />

              <div className="trust-list">
                {currentScenario.sensors.map(
                  (s) => (
                    <div
                      className="trust-row"
                      key={s.name}
                    >
                      <span>
                        {s.name}
                      </span>

                      <div className="trust-bar">
                        <div
                          className={s.status}
                          style={{
                            width: `${s.trust}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {s.trust}
                      </strong>
                    </div>
                  ),
                )}
              </div>

              <div className="trust-note">
                <ShieldCheck size={15} />

                <span>
                  Trust is dynamic evidence
                  weighting, not a claim of
                  sensor truth.
                </span>
              </div>
            </div>

            {/* EVIDENCE */}

            <div
              className="panel evidence-panel"
              id="alert-center"
            >
              <PanelHeading
                eyebrow="EVIDENCE ENGINE"
                title="Why did SYNTRUST decide this?"
              />

              <div className="evidence-summary">
                <div
                  className={`evidence-strength ${
                    currentScenario.integrity >=
                    75
                      ? "high"
                      : currentScenario.integrity >=
                          50
                        ? "medium"
                        : "low"
                  }`}
                >
                  <span>
                    Evidence strength
                  </span>

                  <strong>
                    {currentScenario.integrity >=
                    75
                      ? "HIGH"
                      : currentScenario.integrity >=
                          50
                        ? "MEDIUM"
                        : "LOW"}
                  </strong>
                </div>

                <div className="decision-chip">
                  <span
                    className={`status-dot ${statusClass}`}
                  />

                  {currentScenario.status}
                </div>
              </div>

              <div className="evidence-checks">
                {checks.map((c) => (
                  <div
                    className={`evidence-check ${c.state.toLowerCase()}`}
                    key={c.label}
                  >
                    <div className="evidence-check-icon">
                      {c.state ===
                      "SUPPORTED" ? (
                        <CheckCircle2
                          size={17}
                        />
                      ) : c.state ===
                        "CONFLICT" ? (
                        <XCircle
                          size={17}
                        />
                      ) : (
                        <Clock3
                          size={17}
                        />
                      )}
                    </div>

                    <div>
                      <strong>
                        {c.label}
                      </strong>

                      <p>
                        {c.detail}
                      </p>
                    </div>

                    <span>
                      {c.state}
                    </span>
                  </div>
                ))}
              </div>

              {currentScenario.id ===
                "coordinated" && (
                <div className="agreement-warning">
                  <AlertTriangle
                    size={20}
                  />

                  <div>
                    <strong>
                      Agreement ≠ Truth
                    </strong>

                    <p>
                      When several sensors
                      agree but independent
                      evidence is weak,
                      SYNTRUST avoids a false
                      NORMAL decision and
                      returns{" "}
                      <b>
                        INTEGRITY UNCERTAIN
                      </b>
                      .
                    </p>
                  </div>
                </div>
              )}

              <div className="evidence-box">
                <span>
                  DECISION BASIS
                </span>

                <p>
                  {currentScenario.evidence}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   KPI
------------------------------------------------------- */

function Kpi({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">
        {icon}
        {title}
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------
   PANEL HEADING
------------------------------------------------------- */

function PanelHeading({
  eyebrow,
  title,
  right,
  icon,
}: {
  eyebrow: string;
  title: string;
  right?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h3>{title}</h3>
      </div>

      {right && (
        <span className="panel-time">
          {right}
        </span>
      )}

      {icon && icon}
    </div>
  );
}

/* -------------------------------------------------------
   ADMIN SCREEN
------------------------------------------------------- */

function AdminScreen({
  requests,
  onDecision,
  onLogout,
}: {
  requests: AccessRequest[];
  onDecision: (
    id: string,
    status: AccessRequestStatus,
  ) => void;
  onLogout: () => void;
}) {
  const pending =
    requests.filter(
      (r) => r.status === "PENDING",
    ).length;

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="brand-mark">
            <LockKeyhole size={21} />
          </div>

          <div>
            <strong>SYNTRUST</strong>

            <span>
              SECURITY & ACCESS CENTER
            </span>
          </div>
        </div>

        <div className="admin-top-actions">
          <span className="system-online">
            <span />
            SYSTEM OPERATIONAL
          </span>

          <button
            className="admin-logout"
            onClick={onLogout}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-page-title">
          <div>
            <span className="eyebrow">
              ADMINISTRATOR CONSOLE
            </span>

            <h1>
              Security & Access Center
            </h1>

            <p>
              Control system access and review
              security events. Sensor integrity
              remains handled by the monitoring
              engine.
            </p>
          </div>

          <div className="admin-role">
            <UserCheck size={18} />

            <span>
              Administrator
            </span>
          </div>
        </div>

        <section className="admin-kpi-grid">
          <AdminKpi
            icon={<Users />}
            label="PENDING REQUESTS"
            value={pending.toString()}
            tone="amber"
          />

          <AdminKpi
            icon={<AlertTriangle />}
            label="SECURITY ALERTS"
            value="3"
            tone="red"
          />

          <AdminKpi
            icon={<UserCheck />}
            label="ACTIVE OPERATORS"
            value="4"
            tone="green"
          />

          <AdminKpi
            icon={<Server />}
            label="SYSTEM STATUS"
            value="ONLINE"
            tone="green"
          />
        </section>

        <section className="admin-main-grid">
          <div className="admin-panel">
            <PanelHeading
              eyebrow="ACCESS CONTROL"
              title="Pending Access Requests"
              right={`${pending} pending`}
            />

            {requests.length === 0 ? (
              <div className="empty-state">
                No access requests.
              </div>
            ) : (
              <div className="request-list">
                {requests.map((r) => (
                  <div
                    className="access-request"
                    key={r.id}
                  >
                    <div className="request-avatar">
                      <CircleUserRound
                        size={20}
                      />
                    </div>

                    <div className="request-main">
                      <strong>
                        {r.name}
                      </strong>

                      <span>
                        {r.role} ·{" "}
                        {r.operatorId}
                      </span>

                      <small>
                        <Clock3 size={13} />
                        {r.time} · {r.id}
                      </small>
                    </div>

                    <div
                      className={`request-status ${r.status.toLowerCase()}`}
                    >
                      {r.status}
                    </div>

                    {r.status ===
                      "PENDING" && (
                      <div className="request-actions">
                        <button
                          className="approve-btn"
                          onClick={() =>
                            onDecision(
                              r.id,
                              "APPROVED",
                            )
                          }
                        >
                          <CheckCircle2
                            size={15}
                          />
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            onDecision(
                              r.id,
                              "REJECTED",
                            )
                          }
                        >
                          <XCircle
                            size={15}
                          />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel">
            <PanelHeading
              eyebrow="SECURITY EVENTS"
              title="Alert Center"
            />

            <div className="security-alert-list">
              <SecurityAlert
                level="HIGH"
                title="Unauthorized login attempt"
                detail="Unknown session"
                time="2 min ago"
                code="ACCESS-001"
              />

              <SecurityAlert
                level="MEDIUM"
                title="Speed sensor inconsistency"
                detail="Conflicting evidence"
                time="7 min ago"
                code="SENSOR-014"
              />

              <SecurityAlert
                level="INFO"
                title="Operator access approved"
                detail="Access policy event"
                time="14 min ago"
                code="ACCESS-002"
              />
            </div>
          </div>
        </section>

        <section className="admin-lower-grid">
          <div className="admin-panel audit-panel">
            <PanelHeading
              eyebrow="AUDIT TRAIL"
              title="Recent Activity"
            />

            <div className="audit-row">
              <span>09:31</span>

              <strong>
                Access request submitted
              </strong>

              <small>
                OP-1042
              </small>
            </div>

            <div className="audit-row">
              <span>09:26</span>

              <strong>
                Sensor alert forwarded
              </strong>

              <small>
                SENSOR-014
              </small>
            </div>

            <div className="audit-row">
              <span>09:19</span>

              <strong>
                Admin session opened
              </strong>

              <small>
                ADMIN-01
              </small>
            </div>
          </div>

          <div className="admin-info-strip">
            <div>
              <LockKeyhole size={20} />

              <div>
                <strong>
                  Two security layers
                </strong>

                <p>
                  <b>
                    Access security:
                  </b>{" "}
                  Administrator controls who
                  enters the system.
                </p>

                <p>
                  <b>
                    Sensor security:
                  </b>{" "}
                  SYNTRUST evaluates whether
                  telemetry can be trusted.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   ADMIN KPI
------------------------------------------------------- */

function AdminKpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      className={`admin-kpi ${tone}`}
    >
      <div className="admin-kpi-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SECURITY ALERT
------------------------------------------------------- */

function SecurityAlert({
  level,
  title,
  detail,
  time,
  code,
}: {
  level: string;
  title: string;
  detail: string;
  time: string;
  code: string;
}) {
  return (
    <div
      className={`security-alert ${level.toLowerCase()}`}
    >
      <div className="alert-icon">
        <AlertTriangle size={17} />
      </div>

      <div className="alert-copy">
        <strong>{title}</strong>

        <span>
          {detail} · {time}
        </span>

        <small>{code}</small>
      </div>

      <b className="alert-level">
        {level}
      </b>
    </div>
  );
}

export default App;