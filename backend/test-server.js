/**
 * SeniorCare Test Server - Funciona sem Firebase
 * Para testes iniciais do sistema MQTT
 */

const mqtt = require('mqtt');
const express = require('express');
const cors = require('cors');

// Configuração do Express
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Dados simulados para teste
let currentData = {
    deviceId: "ESP32_SeniorCare_001",
    temperature: 25.0,
    humidity: 60.0,
    o2Saturation: 98,
    fallDetected: false,
    checkinStatus: false,
    healthScore: 100,
    ledStatus: false,
    timestamp: new Date().toISOString(),
    overallStatus: "GOOD"
};

let alerts = [];

// Configuração MQTT
const mqttOptions = {
    host: 'broker.hivemq.com',
    port: 1883,
    clientId: 'SeniorCare_Test_' + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: 4000,
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
            console.log('🎯 Aguardando dados do ESP32...');
        }
    });
});

mqttClient.on('error', (error) => {
    console.error('❌ Erro MQTT:', error);
    systemStats.isOnline = false;
});

// Processamento das mensagens MQTT
mqttClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log('📥 Dados recebidos do ESP32:', data);
        
        systemStats.totalMessages++;
        systemStats.lastMessage = new Date().toISOString();
        
        // Processar dados
        currentData = {
            ...data,
            timestamp: new Date().toISOString(),
            overallStatus: getOverallStatus(data.healthScore)
        };
        
        // Gerar alertas se necessário
        generateAlerts(data);
        
        console.log('✅ Dados processados com sucesso!');
        console.log(`📊 Health Score: ${data.healthScore}`);
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem MQTT:', error);
    }
});

function getOverallStatus(score) {
    if (score < 60) return 'CRITICAL';
    if (score < 80) return 'WARNING';
    return 'GOOD';
}

function generateAlerts(data) {
    if (data.temperature > 37.5) {
        alerts.unshift({
            type: 'FEVER',
            message: 'Temperatura elevada detectada',
            severity: 'HIGH',
            timestamp: new Date().toISOString()
        });
    }
    
    if (data.o2Saturation < 95) {
        alerts.unshift({
            type: 'LOW_OXYGEN',
            message: 'Saturação de oxigênio baixa',
            severity: 'HIGH',
            timestamp: new Date().toISOString()
        });
    }
    
    if (data.fallDetected) {
        alerts.unshift({
            type: 'FALL',
            message: 'Queda detectada!',
            severity: 'CRITICAL',
            timestamp: new Date().toISOString()
        });
    }
    
    // Manter apenas os últimos 10 alertas
    alerts = alerts.slice(0, 10);
}

// Rotas da API
app.get('/', (req, res) => {
    res.json({
        service: 'SeniorCare Test Server',
        version: '1.0.0',
        status: 'running',
        mqtt: {
            connected: systemStats.isOnline,
            topic: MQTT_TOPIC
        },
        stats: systemStats,
        message: '🧪 Servidor de teste funcionando! Configure Firebase para versão completa.'
    });
});

app.get('/current', (req, res) => {
    res.json(currentData);
});

app.get('/alerts', (req, res) => {
    res.json(alerts);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: Date.now() - systemStats.uptime,
        mqtt: systemStats.isOnline,
        totalMessages: systemStats.totalMessages,
        lastMessage: systemStats.lastMessage
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor SeniorCare TEST rodando na porta ${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📡 Current Data: http://localhost:${PORT}/current`);
    console.log('');
    console.log('🧪 MODO TESTE - Sem Firebase');
    console.log('📋 Para usar versão completa, configure Firebase no .env');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Encerrando servidor...');
    mqttClient.end();
    process.exit(0);
});
