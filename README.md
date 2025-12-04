# SeniorCare - Sistema de Monitoramento IoT para Idosos

![SeniorCare Logo](https://img.shields.io/badge/SeniorCare-IoT%20Monitoring-blue?style=for-the-badge&logo=heart)

Sistema híbrido baseado em IoT para monitoramento contínuo de idosos, integrando sensores ESP32, backend em nuvem e dashboard em tempo real.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Características](#características)
- [Componentes](#componentes)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Desenvolvimento](#desenvolvimento)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O **SeniorCare** é um sistema completo de monitoramento IoT projetado para acompanhar a saúde e segurança de idosos em tempo real. Utilizando sensores não invasivos e uma arquitetura robusta em nuvem, o sistema detecta condições adversas e fornece alertas imediatos aos familiares.

### Eventos Monitorados:
- 🌡️ **Temperatura corporal** - Detecção de febre ou hipotermia
- 🫁 **Saturação de Oxigênio** - Monitoramento de SpO₂
- 🚨 **Detecção de Quedas** - Identificação de impactos abruptos
- ✅ **Check-in Manual** - Confirmação de bem-estar

## 🏗️ Arquitetura

```
┌─────────────┐    MQTT     ┌─────────────┐    Firebase    ┌─────────────┐
│    ESP32    │─────────────▶│   Backend   │──────────────▶│  Dashboard  │
│   Sensors   │  HiveMQ     │   Node.js   │   Realtime    │   Web App   │
└─────────────┘             └─────────────┘               └─────────────┘
```

### Componentes da Arquitetura:
1. **Dispositivo IoT (ESP32)** - Coleta dados dos sensores e transmite via MQTT
2. **Backend (Node.js)** - Processa dados, calcula health score e gerencia Firebase
3. **Dashboard Web** - Interface em tempo real com Firebase SDK

## ✨ Características

- ⚡ **Monitoramento em tempo real** com atualização a cada 2 segundos
- 📊 **Health Score** calculado automaticamente baseado nos sensores
- 🚨 **Sistema de alertas** com diferentes níveis de severidade
- 📱 **Dashboard responsivo** com design moderno
- 🔄 **Integração MQTT** para comunicação eficiente
- ☁️ **Armazenamento em nuvem** com Firebase Firestore
- 🎨 **Interface intuitiva** com semáforo de saúde visual
- 📈 **Histórico de dados** para análise de tendências

## 🔧 Componentes

### Hardware Necessário:
- **ESP32-S2-DevKitM-1** - Microcontrolador principal
- **DHT22** - Sensor de temperatura e umidade
- **MPU6050** - Acelerômetro/giroscópio para detecção de quedas
- **Potenciômetro** - Simulação de saturação O₂
- **Botão Push** - Check-in manual
- **LED Vermelho** - Indicador visual de alertas
- **Resistores** - 220Ω e 10kΩ

### Software Necessário:
- **Arduino IDE** com ESP32 Core
- **Node.js** (versão 16+)
- **Firebase Project** configurado
- **HiveMQ Cloud** (broker MQTT gratuito)

## 📦 Instalação

### 1. Clonar o Repositório
```bash
git clone <seu-repositorio>
cd trab-iot-2
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use existente
3. Ative Firestore Database
4. Gere chaves do Service Account
5. Configure as credenciais no arquivo `.env`

### 4. Configurar Firmware
1. Abra `firmware/seniorcare.ino` no Arduino IDE
2. Instale as bibliotecas necessárias:
   - WiFi
   - PubSubClient
   - DHT sensor library
   - ArduinoJson
   - Adafruit MPU6050

## ⚙️ Configuração

### Backend (.env)
```env
PORT=3000
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@meu-esp32.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

### Firebase Config (dashboard/firebase-config.js)
```javascript
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "meu-esp32.firebaseapp.com",
    projectId: "meu-esp32",
    // ... outras configurações
};
```

### Wokwi Simulation
1. Acesse [Wokwi](https://wokwi.com/)
2. Importe o diagrama JSON fornecido
3. Carregue o código `firmware/seniorcare.ino`
4. Execute a simulação

## 🚀 Uso

### 1. Iniciar Backend
```bash
cd backend
npm start
```

### 2. Abrir Dashboard
```bash
cd dashboard
# Abrir index.html em um servidor web local
python -m http.server 8000  # Python
# ou
npx serve .  # Node.js
```

### 3. Executar Simulação Wokwi
- Abra o projeto no Wokwi
- Clique em "Start Simulation"
- Monitore os dados no Serial Monitor e Dashboard

### 4. Interagir com Sensores
- **Potenciômetro**: Ajustar saturação O₂
- **Botão Verde**: Realizar check-in
- **MPU6050**: Simular quedas movimentando o sensor
- **DHT22**: Monitorar temperatura ambiente

## 📊 Dashboard

O dashboard fornece:

### Visão Geral
- **Health Score** - Pontuação de 0-100 baseada nos sensores
- **Status Geral** - Verde (Saudável), Amarelo (Atenção), Vermelho (Crítico)
- **Última Atualização** - Timestamp da última leitura

### Cards dos Sensores
- **Temperatura** - Valor atual e status
- **Saturação O₂** - Percentual SpO₂
- **Movimento** - Status de atividade/quedas
- **Check-in** - Estado do check-in manual

### Alertas
- Lista de alertas recentes com severidade
- Tipos: Febre, Hipotermia, Baixo O₂, Quedas
- Timestamp e detalhes de cada alerta

### Status do Dispositivo
- Device ID, Status do LED, Umidade ambiente

## 🔄 Fluxo de Dados

1. **ESP32** coleta dados dos sensores a cada 2 segundos
2. Dados são enviados via **MQTT** para o broker HiveMQ
3. **Backend Node.js** recebe e processa os dados
4. **Health Score** é calculado baseado nos valores dos sensores
5. Dados são armazenados no **Firebase Firestore**
6. **Dashboard** atualiza em tempo real via Firebase listeners
7. **Alertas** são gerados para condições críticas

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
trab-iot-2/
├── firmware/
│   └── seniorcare.ino          # Código Arduino ESP32
├── backend/
│   ├── package.json            # Dependências Node.js
│   ├── server.js               # Servidor principal
│   └── .env.example            # Template de configuração
├── dashboard/
│   ├── index.html              # Interface principal
│   ├── style.css               # Estilos CSS
│   ├── script.js               # Lógica JavaScript
│   └── firebase-config.js      # Configuração Firebase
├── especificacoes-projeto      # Documentação acadêmica
└── README.md                   # Este arquivo
```

### Adicionando Novos Sensores

1. **Firmware**: Adicionar leitura do sensor em `readSensors()`
2. **Backend**: Processar novo dado em `processIoTData()`
3. **Dashboard**: Criar novo card e atualização em tempo real

### Personalizando Alertas

Edite a função `processIoTData()` no backend para adicionar novas condições de alerta baseadas nos valores dos sensores.

## 🤝 Contribuição

Desenvolvido por **Gabriel Figueiredo** para o projeto SeniorCare da UNISINOS.

### Para contribuir:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte do curso de Ciência da Computação da UNISINOS.

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique a documentação
- Consulte os logs do backend e browser console
- Confirme as configurações do Firebase
- Teste a conectividade MQTT

---

**SeniorCare** - Monitoramento IoT que salva vidas! ❤️
