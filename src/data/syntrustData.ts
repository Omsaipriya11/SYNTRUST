import csvText from "./syntrust_sensor_integrity_dataset.csv?raw";

export interface SensorDataPoint {
  train_id: string;
  scenario_id: string;
  scenario_name: string;
  timestamp_s: number;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  gps_speed_kmh: number;
  wheel_rpm: number;
  brake_pressure_bar: number;
  motor_current_a: number;
  independent_reference_available: boolean;
  ground_truth_speed_kmh: number;
  expected_decision: string;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

function loadDataset(): SensorDataPoint[] {
  const lines = csvText.trim().split(/\r?\n/);

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return {
      train_id: row.train_id,
      scenario_id: row.scenario_id,
      scenario_name: row.scenario_name,
      timestamp_s: Number(row.timestamp_s),
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      speed_kmh: Number(row.speed_kmh),
      gps_speed_kmh: Number(row.gps_speed_kmh),
      wheel_rpm: Number(row.wheel_rpm),
      brake_pressure_bar: Number(row.brake_pressure_bar),
      motor_current_a: Number(row.motor_current_a),
      independent_reference_available:
        row.independent_reference_available === "YES",
      ground_truth_speed_kmh: Number(row.ground_truth_speed_kmh),
      expected_decision: row.expected_decision,
    };
  });
}

export const syntrustDataset = loadDataset();

export function getScenarioData(
  scenarioId: string
): SensorDataPoint[] {
  return syntrustDataset.filter(
    (row) => row.scenario_id === scenarioId
  );
}