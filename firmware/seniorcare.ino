/*
 * SeniorCare - Sistema de Monitoramento IoT para Idosos (Otimizado para Wokwi)
 * ESP32 + DHT22 + MPU6050 + Potenciômetro + Botão + LED
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// Configurações WiFi para Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Configurações MQTT
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "seniorcare/monitor/data";
String mqtt_client_id = "SeniorCare_" + String(random(1000, 9999));

// Pinos dos sensores - EXATAMENTE como no seu diagrama
#define DHT_PIN 4      // DHT22 conectado no pino 4
#define DHT_TYPE DHT22
#define O2_POT_PIN 1   // Potenciômetro no pino 1
#define CHECKIN_BTN_PIN 2  // Botão no pino 2
#define LED_PIN 5      // LED no pino 5
#define MPU_SDA_PIN 8  // MPU6050 SDA no pino 8
#define MPU_SCL_PIN 9  // MPU6050 SCL no pino 9

// Inicialização dos sensores
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_MPU6050 mpu;
WiFiClient espClient;
PubSubClient client(espClient);

// Variáveis globais
unsigned long lastSensorRead = 0;
unsigned long lastMqttSend = 0;
const unsigned long SENSOR_INTERVAL = 3000; // 3 segundos para debug
bool lastButtonState = HIGH;
bool mpuInitialized = false;

// Variáveis dos sensores
float temperature = 25.0;
float humidity = 60.0;
int o2Saturation = 98;
bool fallDetected = false;
bool checkinPressed = false;
int healthScore = 100;

void setup() {
  Serial.begin(115200);
  delay(2000); // Aguardar estabilização
  
  Serial.println("\n=== SENIORCARE SISTEMA INICIADO ===");
  Serial.println("Versão: Wokwi Optimized");
  
  // Configurar pinos
  pinMode(LED_PIN, OUTPUT);
  pinMode(CHECKIN_BTN_PIN, INPUT_PULLUP);
  digitalWrite(LED_PIN, LOW);
  Serial.println("✅ Pinos configurados");
  
  // Testar LED
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  Serial.println("✅ LED testado");
  
  // Inicializar DHT22
  dht.begin();
  Serial.println("✅ DHT22 inicializado");
  
  // Inicializar MPU6050
  Wire.begin(MPU_SDA_PIN, MPU_SCL_PIN);
  Serial.print("🔄 Inicializando MPU6050...");
  
  if (mpu.begin()) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    mpuInitialized = true;
    Serial.println(" ✅ MPU6050 OK");
  } else {
    Serial.println(" ⚠️ MPU6050 não encontrado - continuando sem ele");
    mpuInitialized = false;
  }
  
  // Conectar WiFi
  Serial.print("🔄 Conectando WiFi");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📡 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi falhou - continuando offline");
  }
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.println("\n🚀 SISTEMA PRONTO PARA MONITORAMENTO!");
  Serial.println("=====================================");
}

void loop() {
  // Conectar MQTT se necessário
  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnectMQTT();
  }
  if (client.connected()) {
    client.loop();
  }
  
  // Leitura dos sensores
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    Serial.println("\n--- LEITURA DOS SENSORES ---");
    readSensors();
    calculateHealthScore();
    updateLED();
    printSensorData();
    lastSensorRead = millis();
  }
  
  // Envio MQTT
  if (millis() - lastMqttSend >= SENSOR_INTERVAL && client.connected()) {
    sendMQTTData();
    lastMqttSend = millis();
  }
  
  delay(100);
}

void readSensors() {
  // 1. Testar botão
  bool currentButtonState = digitalRead(CHECKIN_BTN_PIN);
  if (currentButtonState != lastButtonState) {
    if (currentButtonState == LOW) {
      checkinPressed = true;
      Serial.println("✅ CHECK-IN REALIZADO!");
    }
    lastButtonState = currentButtonState;
  }
  
  // 2. Ler DHT22
  float newTemp = dht.readTemperature();
  float newHumidity = dht.readHumidity();
  
  if (!isnan(newTemp) && !isnan(newHumidity)) {
    temperature = newTemp;
    humidity = newHumidity;
    Serial.printf("🌡️ DHT22: %.1f°C, %.1f%%\n", temperature, humidity);
  } else {
    Serial.println("⚠️ DHT22: Erro na leitura");
  }
  
  // 3. Ler potenciômetro
  int potValue = analogRead(O2_POT_PIN);
  o2Saturation = map(potValue, 0, 4095, 85, 100);
  Serial.printf("🫁 O2: %d%% (pot: %d)\n", o2Saturation, potValue);
  
  // 4. Ler MPU6050
  if (mpuInitialized) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    float accelMagnitude = sqrt(a.acceleration.x * a.acceleration.x + 
                               a.acceleration.y * a.acceleration.y + 
                               a.acceleration.z * a.acceleration.z);
    
    if (accelMagnitude > 15.0) {
      fallDetected = true;
      Serial.println("🚨 QUEDA DETECTADA!");
    }
    
    Serial.printf("📐 MPU6050: %.1f m/s²\n", accelMagnitude);
  } else {
    Serial.println("📐 MPU6050: Não disponível");
  }
}

void calculateHealthScore() {
  int oldScore = healthScore;
  healthScore = 100;
  
  // Penalizações
  if (temperature < 36.0 || temperature > 37.5) healthScore -= 20;
  if (o2Saturation < 95) healthScore -= 30;
  else if (o2Saturation < 98) healthScore -= 10;
  if (fallDetected) healthScore -= 40;
  
  // Bonus
  if (checkinPressed) {
    healthScore = min(100, healthScore + 10);
  }
  
  healthScore = max(0, healthScore);
  
  if (healthScore != oldScore) {
    Serial.printf("📊 Health Score: %d → %d\n", oldScore, healthScore);
  }
}

void updateLED() {
  bool shouldLight = (healthScore < 60 || fallDetected || temperature > 38.0 || o2Saturation < 90);
  
  if (shouldLight) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("🔴 LED: ACESO (Alerta!)");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("⚪ LED: Apagado (Normal)");
  }
}

void printSensorData() {
  Serial.println("📋 RESUMO DOS SENSORES:");
  Serial.printf("   Temperatura: %.1f°C\n", temperature);
  Serial.printf("   Umidade: %.1f%%\n", humidity);
  Serial.printf("   O2: %d%%\n", o2Saturation);
  Serial.printf("   Queda: %s\n", fallDetected ? "SIM" : "NÃO");
  Serial.printf("   Check-in: %s\n", checkinPressed ? "SIM" : "NÃO");
  Serial.printf("   Health Score: %d\n", healthScore);
  Serial.printf("   LED: %s\n", digitalRead(LED_PIN) ? "ACESO" : "APAGADO");
}

void reconnectMQTT() {
  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 5000) return; // Tentar apenas a cada 5s
  
  Serial.print("🔄 Conectando MQTT...");
  if (client.connect(mqtt_client_id.c_str())) {
    Serial.println(" ✅ MQTT Conectado!");
  } else {
    Serial.printf(" ❌ Falhou (rc=%d)\n", client.state());
  }
  lastAttempt = millis();
}

void sendMQTTData() {
  StaticJsonDocument<300> doc;
  
  doc["timestamp"] = millis();
  doc["deviceId"] = "ESP32_SeniorCare_Wokwi";
  doc["temperature"] = round(temperature * 100) / 100.0;
  doc["humidity"] = round(humidity * 100) / 100.0;
  doc["o2Saturation"] = o2Saturation;
  doc["fallDetected"] = fallDetected;
  doc["checkinStatus"] = checkinPressed;
  doc["healthScore"] = healthScore;
  doc["ledStatus"] = digitalRead(LED_PIN);
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  if (client.publish(mqtt_topic, jsonString.c_str())) {
    Serial.println("📤 DADOS ENVIADOS VIA MQTT:");
    Serial.println(jsonString);
  } else {
    Serial.println("❌ Falha ao enviar MQTT");
  }
  
  // Reset flags
  fallDetected = false;
  checkinPressed = false;
}
