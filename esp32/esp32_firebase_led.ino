#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configurações WiFi
const char* ssid = "SEU_WIFI_SSID";
const char* password = "SUA_SENHA_WIFI";

// Configurações Firebase
const char* firebase_host = "https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/";
const char* firebase_auth = "SUA_CHAVE_API";

// Configuração do LED
const int LED_PIN = 2; // GPIO2 (LED interno do ESP32)

// Variável para controle do estado anterior
bool ultimoEstado = false;

void setup() {
  Serial.begin(115200);
  
  // Configura o pino do LED como saída
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Conecta ao WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(firebase_host) + "led_status.json?auth=" + firebase_auth);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Resposta do Firebase: " + response);
      
      // Parse do JSON
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, response);
      
      // Verifica se o campo existe e não é nulo
      if (!doc.isNull()) {
        bool ledStatus = doc.as<bool>();
        
        // Só atualiza se o estado mudou
        if (ledStatus != ultimoEstado) {
          if (ledStatus) {
            digitalWrite(LED_PIN, HIGH);
            Serial.println("LED LIGADO");
          } else {
            digitalWrite(LED_PIN, LOW);
            Serial.println("LED DESLIGADO");
          }
          ultimoEstado = ledStatus;
        }
      }
    } else {
      Serial.println("Erro na requisição HTTP: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado!");
  }
  
  delay(1000); // Verifica a cada 1 segundo
}