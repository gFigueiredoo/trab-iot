#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/RTDBHelper.h"
#include "addons/TokenHelper.h"

// ====== CONFIG WIFI ======
#define WIFI_SSID "SEU_SSID"
#define WIFI_PASSWORD "SUA_SENHA"

// ====== CONFIG FIREBASE ======
#define API_KEY "AIzaSyAg_hYw7LBuxBb_GMSTuoj3uaa6BnY78KI"
#define DATABASE_URL "https://trab-iot-default-rtdb.firebaseio.com"  // sem a barra final

// Auth anônimo (se regras permitem)
FirebaseAuth auth;
FirebaseConfig config;

// Objetos globais
FirebaseData fbData;
FirebaseData stream;
bool streamInicializado = false;

const int LED_PIN = 2;      // Ajustar se usar outro pino
bool estadoLocalLED = false;

// ====== FUNÇÃO PARA ATUALIZAR LED FISICO ======
void aplicarEstadoLED(bool ligado) {
  estadoLocalLED = ligado;
  digitalWrite(LED_PIN, ligado ? HIGH : LOW);
  Serial.printf("LED físico agora: %s\n", ligado ? "LIGADO" : "DESLIGADO");
}

// ====== CALLBACK STREAM ======
void streamCallback(FirebaseStream data) {
  Serial.printf("Stream update: path=%s type=%s\n", data.dataPath().c_str(), data.dataType().c_str());
  if (data.dataType() == "boolean") {
    bool valor = data.boolData();
    aplicarEstadoLED(valor);
  } else {
    Serial.println("Tipo inesperado no nó led_status");
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timeout, reconectando...");
  }
  if (!stream.httpConnected()) {
    Serial.printf("Stream HTTP erro: %d\n", stream.httpCode());
  }
}

// ====== SETUP ======
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  aplicarEstadoLED(false);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Config Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Login anônimo (gera token para requisições)
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Auth anônimo OK");
  } else {
    Serial.printf("Erro signup: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  // Iniciar stream do nó led_status
  if (!Firebase.RTDB.beginStream(&stream, "/led_status")) {
    Serial.printf("Erro iniciando stream: %s\n", stream.errorReason().c_str());
  } else {
    Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
    streamInicializado = true;
    Serial.println("Stream led_status ativo!");
  }

  // Ler valor inicial (caso stream demore)
  if (Firebase.RTDB.getBool(&fbData, "/led_status")) {
    aplicarEstadoLED(fbData.boolData());
  } else {
    Serial.printf("Falha leitura inicial: %s\n", fbData.errorReason().c_str());
  }
}

// ====== LOOP ======
void loop() {
  // Nada pesado: stream cuida das mudanças
  // Se quiser enviar estado manualmente (por exemplo se você apertasse um botão físico):
  // if (Firebase.RTDB.setBool(&fbData, "/led_status", estadoLocalLED)) { ... }
}