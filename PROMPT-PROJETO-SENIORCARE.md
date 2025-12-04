# 🏥 PROMPT COMPLETO - PROJETO SENIORCARE

**Copie e cole este prompt em outros chats de IA para obter ajuda específica sobre meu projeto.**

---

## 📋 CONTEXTO DO PROJETO

Sou Gabriel Figueiredo, estudante de Ciência da Computação da UNISINOS, desenvolvendo o **SeniorCare** - um sistema IoT híbrido para monitoramento de idosos como trabalho acadêmico.

## 🎯 OBJETIVO DO SISTEMA

Sistema completo de monitoramento em tempo real que detecta:
- 🌡️ **Temperatura corporal** anormal (febre/hipotermia)
- 🫁 **Saturação de oxigênio** baixa (SpO₂)
- 🚨 **Quedas** através de acelerômetro
- ✅ **Check-ins manuais** para confirmação de bem-estar

## 🏗️ ARQUITETURA IMPLEMENTADA

```
ESP32 (Wokwi) → MQTT (HiveMQ) → Backend (Node.js) → Dashboard (Web)
     ↓               ↓               ↓               ↓
  Sensores        Broker          Firebase        Tempo Real
```

### **Fluxo de Dados:**
1. ESP32 coleta dados dos sensores a cada 2-3 segundos
2. Envia via MQTT para broker.hivemq.com
3. Backend Node.js processa e calcula Health Score (0-100)
4. Armazena no Firebase Firestore
5. Dashboard atualiza em tempo real

## 🔧 COMPONENTES TÉCNICOS

### **Hardware (Wokwi Simulation):**
- **ESP32-S2-DevKitM-1** - Microcontrolador principal
- **DHT22** - Sensor temperatura/umidade (pino 4)
- **MPU6050** - Acelerômetro para quedas (pinos 8/9)
- **Potenciômetro** - Simulação saturação O₂ (pino 1)
- **Botão Verde** - Check-in manual (pino 2)
- **LED Vermelho** - Indicador de alerta (pino 5)
- **Resistores** - 220Ω (LED) e 10kΩ (pull-up botão)

### **Firmware (ESP32):**
```cpp
// Bibliotecas principais
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>

// Configurações
WiFi: "Wokwi-GUEST" (simulado)
MQTT: broker.hivemq.com:1883
Topic: "seniorcare/monitor/data"
```

### **Backend (Node.js):**
```javascript
// Dependências principais
const mqtt = require('mqtt');
const admin = require('firebase-admin');
const express = require('express');

// Funcionalidades
- Cliente MQTT subscrito em "seniorcare/monitor/data"
- Processamento de dados e cálculo de Health Score
- API REST (Express) com rotas /current, /alerts, /health
- Integração Firebase Admin SDK
```

### **Dashboard (Web):**
```html
<!-- Tecnologias -->
HTML5 + CSS3 + JavaScript vanilla
Firebase Web SDK para tempo real
Interface responsiva com cards dos sensores
```

## 📊 LÓGICA DE NEGÓCIO - HEALTH SCORE

**Fórmula do Health Score (0-100):**
```
Score inicial = 100
- Temperatura fora de 36-37.5°C: -20 pontos
- Saturação O₂ < 95%: -30 pontos
- Saturação O₂ < 98%: -10 pontos
- Queda detectada: -40 pontos
+ Check-in realizado: +10 pontos
```

**Status baseado no Score:**
- 90-100: "Excelente" (Verde)
- 80-89: "Bom" (Verde)
- 60-79: "Atenção" (Amarelo)
- 0-59: "Crítico" (Vermelho)

**LED vermelho acende quando:**
- Health Score < 60
- Temperatura > 38°C
- Saturação O₂ < 90%
- Queda detectada

## 📁 ESTRUTURA DOS ARQUIVOS

```
trab-iot-2/
├── firmware/
│   ├── seniorcare.ino              # Código principal ESP32
│   ├── seniorcare-wokwi.ino        # Versão otimizada Wokwi
│   └── seniorcare-simple.ino       # Versão sem WiFi/MQTT
├── backend/
│   ├── package.json                # Dependências Node.js
│   ├── server.js                   # Servidor principal com Firebase
│   ├── test-server.js              # Servidor teste sem Firebase
│   ├── .env.example                # Template configurações
│   └── .env                        # Credenciais Firebase
├── dashboard/
│   ├── index.html                  # Dashboard principal
│   ├── test-dashboard.html         # Versão teste
│   ├── style.css                   # Estilos
│   ├── script.js                   # Lógica JavaScript
│   └── firebase-config.js          # Config Firebase cliente
├── wokwi-diagram.json              # Diagrama circuito Wokwi
├── README.md                       # Documentação técnica
├── SETUP-GUIDE.md                  # Guia instalação
└── TESTE-WOKWI.md                  # Guia teste Wokwi
```

## 🔌 CONFIGURAÇÕES ATUAIS

### **Firebase:**
```javascript
const firebaseConfig = {
    projectId: "meu-esp32",
    authDomain: "meu-esp32.firebaseapp.com",
    databaseURL: "https://meu-esp32-default-rtdb.firebaseio.com/",
    // ... outras configs
};
```

### **Collections Firestore:**
- `seniorcare` (documento 'current') - Dados atuais
- `seniorcare-history` - Histórico de leituras
- `seniorcare-alerts` - Alertas gerados

### **Formato JSON dos Dados:**
```json
{
  "timestamp": 12345,
  "deviceId": "ESP32_SeniorCare_Wokwi",
  "temperature": 24.0,
  "humidity": 40.0,
  "o2Saturation": 85,
  "fallDetected": false,
  "checkinStatus": false,
  "healthScore": 50,
  "ledStatus": true,
  "overallStatus": "CRITICAL"
}
```

## ✅ STATUS ATUAL DO PROJETO

### **Funcionando 100%:**
- ✅ ESP32 conectando WiFi no Wokwi
- ✅ MQTT enviando dados para HiveMQ
- ✅ Backend recebendo e processando dados
- ✅ Health Score calculado corretamente
- ✅ LED acendendo em alertas
- ✅ Dashboard básico funcionando
- ✅ Integração completa ESP32 → Backend → Dashboard

### **Para Melhorar:**
- Firebase integration completa
- Alertas por email/SMS
- Gráficos históricos
- Mobile responsiveness
- Autenticação de usuários

## 🧪 COMO TESTAR

1. **Wokwi**: Abra projeto, cole código, inicie simulação
2. **Backend**: `cd backend && npm start`
3. **Dashboard**: Abra `test-dashboard.html` em navegador
4. **Interação**: Gire potenciômetro, clique botão, ajuste sensores

## ❓ TIPOS DE AJUDA QUE PRECISO

Você pode me ajudar com:
- **Código**: Melhorias no firmware, backend ou frontend
- **Firebase**: Configurações, regras de segurança, otimizações
- **MQTT**: Configurações avançadas, segurança
- **Interface**: Melhorias no dashboard, responsividade
- **Algoritmos**: Otimização do Health Score, detecção de padrões
- **Integração**: Conectar com APIs externas, notificações
- **Performance**: Otimização do sistema, redução de latência
- **Documentação**: Melhorar guias e instruções

---

**💡 IMPORTANTE:** Este é um projeto acadêmico funcional com todos os componentes integrados. O sistema monitora saúde de idosos em tempo real através de sensores IoT, processa dados via MQTT/Firebase e exibe em dashboard web.
