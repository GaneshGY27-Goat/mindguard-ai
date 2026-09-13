/**
 * MindGuard AI - ESP32 Physical Wearable Firmware Prototype
 * 
 * Hardware Bill of Materials:
 * 1. ESP32 NodeMCU Development Board
 * 2. MAX30102 Pulse Oximeter & Heart-Rate Sensor (I2C)
 * 3. MPU6050 3-Axis Accelerometer & Gyroscope (I2C)
 * 4. 0.96" I2C SSD1306 OLED Display (Optional for on-wrist feedback)
 * 
 * Wiring Configuration (I2C Bus):
 * ESP32 GPIO 21  <-->  MAX30102 SDA  <-->  MPU6050 SDA
 * ESP32 GPIO 22  <-->  MAX30102 SCL  <-->  MPU6050 SCL
 * ESP32 3V3      <-->  Sensor VCC
 * ESP32 GND      <-->  Sensor GND
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "MAX30105.h"           // SparkFun MAX3010x Library
#include "heartRate.h"
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi Configuration
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MindGuard Backend Endpoint
const char* serverEndpoint = "http://192.168.1.100:5000/api/sensor-data";

// Sensors
MAX30105 particleSensor;
Adafruit_MPU6050 mpu;

// Step Counting State Machine
long stepCount = 0;
float prevMagnitude = 0;
const float STEP_THRESHOLD = 12.2; // m/s^2 magnitude trigger

// Heart rate tracking
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 72;
int beatAvg = 72;
int currentSpo2 = 98;

unsigned long lastTelemetrySent = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  Serial.println("\n--- MindGuard AI ESP32 Wearable Initializing ---");

  // 1. Initialize WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());

  // 2. Initialize MAX30102 PPG Sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("WARNING: MAX30102 not detected. Check I2C wiring.");
  } else {
    particleSensor.setup(); 
    particleSensor.setPulseAmplitudeRed(0x0A); // Low power LED
    particleSensor.setPulseAmplitudeGreen(0);  // Green off
  }

  // 3. Initialize MPU6050 Accelerometer
  if (!mpu.begin()) {
    Serial.println("WARNING: MPU6050 not detected. Check I2C wiring.");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("MPU6050 configured for pedometer step detection.");
  }
}

void loop() {
  // 1. Sample PPG for Heart Rate
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);
    if (beatsPerMinute < 255 && beatsPerMinute > 40) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++) beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // 2. Sample Accelerometer for Step Counting
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float magnitude = sqrt(a.acceleration.x * a.acceleration.x +
                         a.acceleration.y * a.acceleration.y +
                         a.acceleration.z * a.acceleration.z);

  // Peak detection for steps
  if (magnitude > STEP_THRESHOLD && prevMagnitude <= STEP_THRESHOLD) {
    stepCount++;
  }
  prevMagnitude = magnitude;

  // 3. Periodic Telemetry Transmission to MindGuard AI Backend
  if (millis() - lastTelemetrySent > TELEMETRY_INTERVAL_MS) {
    lastTelemetrySent = millis();
    sendTelemetry(beatAvg, currentSpo2, stepCount);
  }
}

void sendTelemetry(int hr, int spo2, long steps) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverEndpoint);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload
  String payload = "{";
  payload += "\"heartRate\":" + String(hr) + ",";
  payload += "\"spo2\":" + String(spo2) + ",";
  payload += "\"steps\":" + String(steps) + ",";
  payload += "\"sleepHours\":7.2,";
  payload += "\"moodScore\":6,";
  payload += "\"voiceStress\":\"LOW\"";
  payload += "}";

  Serial.println("Dispatching Telemetry -> " + payload);
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Server Response (" + String(httpResponseCode) + "): " + response);
  } else {
    Serial.println("HTTP POST failed, error: " + String(httpResponseCode));
  }

  http.end();
}
