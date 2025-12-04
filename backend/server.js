/**
 * SeniorCare Backend Server
 * Processa dados MQTT do ESP32 e armazena no Firebase
 * 
 * Autor: Gabriel Figueiredo - SeniorCare Team
 */

const mqtt = require('mqtt');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "meu-esp32",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://meu-esp32-default-rtdb.firebaseio.com/"
});

const db = admin.firestore();

// Configuração MQTT
const mqttOptions = {
  host: 'broker.hivemq.com',
  port: 1883,
  clientId: 'SeniorCare_Backend_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  username: '',
  password: '',
  reconnectPeriod: 1000,
};

const mqttClient = mqtt.connect(mqttOptions);
const MQTT_TOPIC = 'seniorcare/monitor/data';

// Estados do sistema
let systemStats = {
  totalMessages: 0,
  lastMessage: null,
  uptime: Date.now(),
  isOnline: false
};

// Conexão MQTT
mqttClient.on('connect', () => {
  console.log('🟢 Conectado ao broker MQTT HiveMQ');
  systemStats.isOnline = true;
  
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('❌ Erro ao se inscrever no tópico:', err);
    } else {
      console.log(`📡 Inscrito no tópico: ${MQTT_TOPIC}`);
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('❌ Erro MQTT:', error);
  systemStats.isOnline = false;
});

mqttClient.on('offline', () => {
  console.log('🔴 MQTT desconectado');
  systemStats.isOnline = false;
});

// Processamento das mensagens MQTT
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('📥 Dados recebidos:', data);
    
    systemStats.totalMessages++;
    systemStats.lastMessage = new Date().toISOString();
    
    // Processar e enriquecer os dados
    const processedData = await processIoTData(data);
    
    // Salvar no Firebase
    await saveToFirebase(processedData);
    
    console.log('✅ Dados processados e salvos no Firebase');
    
  } catch (error) {
    console.error('❌ Erro ao processar mensagem MQTT:', error);
  }
});

// Função para processar dados IoT
async function processIoTData(rawData) {
  const timestamp = new Date();
  
  // Calcular alertas baseados nos dados
  const alerts = [];
  
  if (rawData.temperature > 37.5) {
    alerts.push({
      type: 'FEVER',
      message: 'Temperatura elevada detectada',
      severity: 'HIGH',
      value: rawData.temperature
    });
  }
  
  if (rawData.temperature < 36.0) {
    alerts.push({
      type: 'HYPOTHERMIA',
      message: 'Temperatura baixa detectada',
      severity: 'MEDIUM',
      value: rawData.temperature
    });
  }
  
  if (rawData.o2Saturation < 95) {
    alerts.push({
      type: 'LOW_OXYGEN',
      message: 'Saturação de oxigênio baixa',
      severity: 'HIGH',
      value: rawData.o2Saturation
    });
  }
  
  if (rawData.fallDetected) {
    alerts.push({
      type: 'FALL',
      message: 'Queda detectada!',
      severity: 'CRITICAL',
      timestamp: timestamp
    });
  }
  
  // Determinar status geral baseado no health score
  let overallStatus = 'GOOD';
  if (rawData.healthScore < 60) {
    overallStatus = 'CRITICAL';
  } else if (rawData.healthScore < 80) {
    overallStatus = 'WARNING';
  }
  
  return {
    ...rawData,
    timestamp: timestamp,
    alerts: alerts,
    overallStatus: overallStatus,
    processedAt: new Date().toISOString()
  };
}

// Função para salvar no Firebase
async function saveToFirebase(data) {
  try {
    // Salvar leitura atual
    await db.collection('seniorcare').doc('current').set({
      ...data,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Salvar no histórico
    await db.collection('seniorcare-history').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Salvar alertas se existirem
    if (data.alerts && data.alerts.length > 0) {
      for (const alert of data.alerts) {
        await db.collection('seniorcare-alerts').add({
          ...alert,
          deviceId: data.deviceId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          acknowledged: false
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar no Firebase:', error);
    throw error;
  }
}

// Rotas da API
app.get('/', (req, res) => {
  res.json({
    service: 'SeniorCare Backend',
    version: '1.0.0',
    status: 'running',
    mqtt: {
      connected: systemStats.isOnline,
      topic: MQTT_TOPIC
    },
    stats: systemStats
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Date.now() - systemStats.uptime,
    mqtt: systemStats.isOnline,
    firebase: true, // Assume que está conectado se chegou até aqui
    totalMessages: systemStats.totalMessages,
    lastMessage: systemStats.lastMessage
  });
});

// Rota para obter dados atuais
app.get('/current', async (req, res) => {
  try {
    const doc = await db.collection('seniorcare').doc('current').get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.status(404).json({ error: 'Dados não encontrados' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para histórico
app.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const snapshot = await db.collection('seniorcare-history')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para alertas
app.get('/alerts', async (req, res) => {
  try {
    const snapshot = await db.collection('seniorcare-alerts')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor SeniorCare rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Tratamento de erros
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor...');
  mqttClient.end();
  process.exit(0);
});
