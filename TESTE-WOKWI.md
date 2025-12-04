# 🚀 Guia Rápido - Configurar Wokwi para SeniorCare

## 📋 **Resposta à sua pergunta:**
**❌ NÃO precisa de WiFi real no Wokwi!** O Wokwi simula a conectividade automaticamente.

## 🔧 **Passo a Passo para Configurar:**

### **1. Abrir Wokwi** (1 minuto)
1. Acesse [wokwi.com](https://wokwi.com/)
2. Clique em **"Start New Project"**
3. Escolha **"ESP32"**

### **2. Importar o Diagrama** (1 minuto)
1. No Wokwi, clique no ícone **"⚙️ Settings"** ou **"diagram.json"**
2. Apague todo o conteúdo atual
3. **Cole o conteúdo do arquivo `wokwi-diagram.json`** (que acabei de criar)
4. Pressione **Ctrl+S** para salvar

### **3. Carregar o Código** (1 minuto)
1. Na aba **"sketch.ino"** do Wokwi
2. Apague todo o código atual
3. **Cole o conteúdo do arquivo `firmware/seniorcare.ino`**
4. Pressione **Ctrl+S** para salvar

### **4. Instalar Bibliotecas** (1 minuto)
No Wokwi, clique em **"Library Manager"** e adicione:
- ✅ **WiFi** (já incluída no ESP32)
- ✅ **PubSubClient** (para MQTT)
- ✅ **DHT sensor library**
- ✅ **ArduinoJson** 
- ✅ **Adafruit MPU6050**
- ✅ **Adafruit Unified Sensor**

### **5. Iniciar Simulação** (30 segundos)
1. Clique no botão **"▶️ Start Simulation"**
2. Abra o **Serial Monitor** para ver os logs
3. **Aguarde** as mensagens:
   ```
   WiFi conectado!
   Tentando conexão MQTT... conectado!
   Dados enviados via MQTT: {...}
   ```

## 🎯 **O que deve acontecer:**

### **No Serial Monitor do Wokwi:**
```
SeniorCare - Sistema iniciado!
Conectando ao WiFi...
...
WiFi conectado!
Endereço IP: 192.168.1.100
Sistema pronto para monitoramento!
Tentando conexão MQTT... conectado!
Dados enviados via MQTT:
{"timestamp":12345,"deviceId":"ESP32_SeniorCare_001",...}
```

### **No seu Terminal (Backend):**
```
📥 Dados recebidos do ESP32: {...}
✅ Dados processados com sucesso!
📊 Health Score: 100
```

### **No Dashboard:**
- Status mudará para **"✅ ESP32 Enviando Dados"**
- Valores dos sensores aparecerão automaticamente
- Atualizações a cada 2-3 segundos

## 🧪 **Testar os Sensores no Wokwi:**

### **🌡️ Temperatura (DHT22):**
- Clique no DHT22 e ajuste a temperatura
- Teste: coloque **38°C** → LED deve acender vermelho

### **🫁 O₂ (Potenciômetro):**
- Gire o potenciômetro "O2 Saturation"  
- Teste: coloque **90%** → alerta deve aparecer

### **✅ Check-in (Botão Verde):**
- Clique no botão verde "Check-in"
- Health Score deve aumentar

### **🚨 Queda (MPU6050):**
- Clique no MPU6050 e "balance" ele
- Simule movimento brusco → LED acende

## 🔍 **Checklist de Funcionamento:**

- [ ] WiFi conectou no Wokwi ✅
- [ ] MQTT conectou (broker.hivemq.com) ✅  
- [ ] Dados sendo enviados a cada 2 segundos ✅
- [ ] Backend recebendo dados ✅
- [ ] Dashboard atualizando automaticamente ✅
- [ ] Sensores reagindo às mudanças ✅
- [ ] LED acendendo em situações críticas ✅

## 🎉 **Sucesso!**
Quando você ver dados chegando no dashboard e conseguir interagir com os sensores, o sistema está **100% funcional**!

---

**⚠️ Dica importante:** Mantenha o terminal do backend rodando (`node test-server.js`) e o dashboard aberto enquanto testa no Wokwi!
