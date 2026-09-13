# Physical Wearable Hardware Integration Guide: ESP32 + MAX30102 + MPU6050

This blueprint outlines how to build a physical wristband or wearable node for **MindGuard AI**.

---

## 1. Hardware Architecture

```
+-------------------------------------------------------------+
|                      ESP32 Microcontroller                  |
|  - Dual-Core Tensilica Xtensa 32-bit LX6                    |
|  - Integrated 2.4 GHz Wi-Fi & Bluetooth LE                  |
|  - Operating Voltage: 3.3V Logic                            |
+--------------+------------------------------+---------------+
               |                              |
      I2C Bus (SDA: GPIO 21, SCL: GPIO 22)    | 3.3V Power Rail
               |                              |
       +-------+-------+              +-------+-------+
       |               |              |               |
+------+-----+   +-----+------+ +-----+------+  +-----+------+
|  MAX30102  |   |  MPU-6050  | |  SSD1306   |  | 500mAh     |
|  Pulse Ox  |   | 6-Axis IMU | | OLED Disp  |  | LiPo Batt  |
|  & Heart   |   | (Pedometer | | (Optional  |  | & TP4056   |
|  Rate PPG  |   | & Motion)  | | Wrist UI)  |  | Charger    |
+------------+   +------------+ +------------+  +------------+
```

---

## 2. Pin Connections

| Peripheral Component | Pin Name | ESP32 GPIO Pin | Description |
|---|---|---|---|
| **MAX30102** | VCC | 3V3 | Power (3.3V) |
| **MAX30102** | GND | GND | Ground |
| **MAX30102** | SDA | GPIO 21 | Shared I2C Data |
| **MAX30102** | SCL | GPIO 22 | Shared I2C Clock |
| **MAX30102** | INT | GPIO 19 (Optional) | PPG FIFO Data Ready Interrupt |
| **MPU-6050** | VCC | 3V3 | Power (3.3V) |
| **MPU-6050** | GND | GND | Ground |
| **MPU-6050** | SDA | GPIO 21 | Shared I2C Data |
| **MPU-6050** | SCL | GPIO 22 | Shared I2C Clock |
| **MPU-6050** | AD0 | GND | Sets I2C Address to `0x68` |

---

## 3. Required Arduino IDE Libraries

In the Arduino IDE Library Manager (`Ctrl+Shift+I` or `Cmd+Shift+I`), install:
1. **SparkFun MAX3010x Pulse and Proximity Sensor Library** by SparkFun Electronics
2. **Adafruit MPU6050** by Adafruit
3. **Adafruit Unified Sensor** by Adafruit
4. **ArduinoJson** (Optional if using structured JSON serialization)

---

## 4. Signal Processing & Calibration

### A. Heart Rate & HRV Detection (MAX30102)
- The MAX30102 shines optical Red (660nm) and Infrared (880nm) light into cutaneous capillary beds.
- Oxygenated hemoglobin absorbs more IR light, while deoxygenated hemoglobin absorbs more Red light.
- Ensure the optical window is mounted snug against the wrist skin using an elastic strap to prevent ambient light noise (photobleaching).
- The `checkForBeat()` algorithm detects peak valleys in the AC component of the reflected IR signal to compute peak-to-peak inter-beat intervals (RR-intervals).

### B. Pedometer Step Detection (MPU6050)
- The 3-axis accelerometer measures dynamic acceleration across X, Y, and Z axes.
- The vector magnitude:
  $$\|A\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
- When walking or running, foot strikes produce cyclical spikes exceeding $12.0\text{ m/s}^2$ followed by gravitational settling ($9.8\text{ m/s}^2$).
- Peak detection logic filters false positive arm flinches.

---

## 5. Ingestion Protocol to MindGuard AI

The firmware dispatches an HTTP POST request to the backend:
- **Endpoint**: `http://<YOUR_LOCAL_IP>:5000/api/sensor-data`
- **Headers**: `Content-Type: application/json`
- **JSON Payload Format**:
```json
{
  "heartRate": 76,
  "spo2": 98,
  "steps": 7240,
  "sleepHours": 7.5,
  "moodScore": 7,
  "voiceStress": "LOW"
}
```

The backend immediately ingests the packet, updates historical rollups, evaluates stress risks, and broadcasts telemetry to the React dashboard.
