# SYNTRUST

### Sensors report. Evidence decides.

SYNTRUST is a sensor integrity and evidence-fusion prototype designed to detect potentially manipulated railway telemetry by comparing multiple sensor signals instead of blindly trusting a single reading.

The system evaluates sensor behavior, cross-sensor consistency, physical evidence, temporal changes, and sensor trust to classify an event as:

- NORMAL
- GENUINE PHYSICAL EVENT
- POTENTIAL MANIPULATION
- INTEGRITY UNCERTAIN

> **AI recommends. The operator decides.**

---

## Problem

Modern infrastructure systems depend on multiple sensors to understand what is happening in the physical world.

However, a sensor can:

- malfunction
- drift gradually
- report manipulated values
- disagree with other sensors
- become part of a coordinated multi-sensor attack

A simple anomaly detector may identify an unusual value, but that does not necessarily mean the physical event is malicious.

For example:

A train slowing down rapidly could be:

- a genuine braking event
- a faulty speed sensor
- manipulated telemetry
- a coordinated attack affecting multiple signals

SYNTRUST focuses on the harder question:

> **Can the evidence behind the sensor reading be trusted?**

---

## Solution

SYNTRUST combines multiple telemetry signals and evaluates their consistency before producing an integrity decision.

### Sensor signals used

- Speed
- GPS speed
- Wheel RPM
- Brake pressure
- Motor current

The system assigns dynamic trust values to sensor signals and combines multiple pieces of evidence to produce an integrity assessment.

---

## Core Architecture

```text
Sensor / Dataset Input
        |
        v
+-------------------------+
| Telemetry Processing    |
+-------------------------+
        |
        v
+-------------------------+
| Cross-Sensor Analysis   |
| Speed / GPS / Wheel     |
| Brake / Motor           |
+-------------------------+
        |
        v
+-------------------------+
| Evidence Evaluation     |
+-------------------------+
        |
        v
+-------------------------+
| Dynamic Sensor Trust    |
+-------------------------+
        |
        v
+-------------------------+
| Integrity Assessment    |
+-------------------------+
        |
        v
+-------------------------+
| Decision + Explanation  |
+-------------------------+
        |
        v
   Operator Dashboard
