# Guia de Setup Completo - SeniorCare

Este guia te levará passo a passo pela configuração completa do sistema SeniorCare.

## 🚀 Setup Rápido (5 minutos)

### 1. Configurar Firebase (2 min)

#### Passo 1: Criar/Configurar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione ou crie o projeto `meu-esp32`
3. Ative **Firestore Database** (modo teste inicialmente)

#### Passo 2: Obter Credenciais do Service Account
1. Vá em **Project Settings** ⚙️ > **Service Accounts**
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON

#### Passo 3: Configurar Backend
1. Abra `backend/.env`
2. Substitua as credenciais pelos valores do arquivo JSON baixado:
   ```env
   FIREBASE_PRIVATE_KEY_ID=valor_do_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOLE_A_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@meu-esp32.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=valor_do_client_id
   ```

#### Passo 4: Configurar Dashboard
1. Abra `dashboard/firebase-config.js`
2. Substitua a configuração pelas suas credenciais Firebase (encontre em Project Settings > General):
   ```javascript
   const firebaseConfig = {
       apiKey: "SUA_API_KEY",
       authDomain: "meu-esp32.firebaseapp.com",
       projectId: "meu-esp32",
       // ... resto da configuração
   };
   ```

### 2. Instalar Dependências (1 min)

```bash
cd backend
npm install
```

### 3. Testar Backend (1 min)

```bash
cd backend
npm start
```

Você deve ver:
```
🚀 Servidor SeniorCare rodando na porta 3000
🟢 Conectado ao broker MQTT HiveMQ
📡 Inscrito no tópico: seniorcare/monitor/data
```

### 4. Testar Dashboard (1 min)

```bash
cd dashboard
python -m http.server 8000
# ou
npx serve .
```

Abra http://localhost:8000 e verifique se carrega sem erros no console.

## 🔧 Configurar Simulação Wokwi

### 1. Criar Projeto Wokwi
1. Acesse [Wokwi.com](https://wokwi.com/)
2. Crie novo projeto ESP32
3. Cole o diagram.json do seu projeto original

### 2. Carregar Código
1. Substitua o código pelo conteúdo de `firmware/seniorcare.ino`
2. Clique em **"Start Simulation"**

### 3. Monitorar Dados
- **Serial Monitor**: Veja logs de conexão e envio MQTT
- **Backend**: Verifique se está recebendo dados
- **Dashboard**: Monitore atualizações em tempo real

## 🧪 Teste Completo da Integração

### Cenário 1: Teste Básico de Conectividade
1. ✅ Backend rodando e conectado ao MQTT
2. ✅ Dashboard carregando e conectado ao Firebase  
3. ✅ ESP32 enviando dados via MQTT
4. ✅ Dados aparecendo no dashboard em tempo real

### Cenário 2: Teste dos Sensores
1. **Temperatura**: Varie a temperatura ambiente no Wokwi
2. **O₂**: Ajuste o potenciômetro (85-100%)
3. **Check-in**: Pressione o botão verde
4. **Queda**: Movimente o MPU6050 bruscamente

### Cenário 3: Teste de Alertas
1. **Temperatura alta**: Configure DHT22 > 37.5°C
2. **O₂ baixo**: Ajuste potenciômetro < 95%
3. **Queda**: Sacuda o MPU6050
4. Verifique se aparecem alertas no dashboard

## 🔍 Diagnóstico de Problemas

### Backend não conecta ao Firebase
```bash
# Verifique se as credenciais estão corretas
node -e "console.log(process.env.FIREBASE_PRIVATE_KEY)"
```

### Dashboard não recebe dados
1. Abra Developer Tools (F12)
2. Verifique Console por erros
3. Confirme se Firebase Config está correto
4. Teste conexão: `firebase.firestore().collection('seniorcare').get()`

### ESP32 não envia dados MQTT
1. Verifique Serial Monitor no Wokwi
2. Confirme se WiFi conectou (`WiFi conectado!`)
3. Veja se MQTT conectou (`conectado!`)
4. Monitore envio de dados (`Dados enviados via MQTT`)

### MQTT não chega no Backend
1. Teste broker MQTT manualmente:
   ```bash
   npm install -g mqtt
   mqtt subscribe -t 'seniorcare/monitor/data' -h broker.hivemq.com
   ```

## 📊 Validação dos Dados

### Estrutura Esperada no Firebase
```json
{
  "deviceId": "ESP32_SeniorCare_001",
  "temperature": 25.6,
  "humidity": 60.2,
  "o2Saturation": 98,
  "fallDetected": false,
  "checkinStatus": false,
  "healthScore": 100,
  "ledStatus": false,
  "timestamp": "2024-12-03T22:15:30.000Z",
  "overallStatus": "GOOD"
}
```

### Health Score Calculation
- **Temperatura normal (36-37.5°C)**: +0 pontos
- **Temperatura anormal**: -20 pontos
- **O₂ > 95%**: +0 pontos
- **O₂ < 95%**: -30 pontos
- **Queda detectada**: -40 pontos
- **Check-in realizado**: +10 pontos

## 🎯 Checklist Final

- [ ] Firebase configurado e Firestore ativo
- [ ] Backend rodando sem erros
- [ ] Dashboard carregando corretamente
- [ ] ESP32 conectado ao WiFi
- [ ] MQTT funcionando (ESP32 → Backend)
- [ ] Dados aparecendo no dashboard
- [ ] Alertas sendo gerados corretamente
- [ ] Health Score sendo calculado
- [ ] Todas as interações funcionando

## 📱 Demonstração

Para uma demonstração completa:

1. **Inicie tudo**: Backend + Dashboard + Wokwi
2. **Cenário Normal**: Deixe funcionando normalmente (Health Score = 100)
3. **Cenário Check-in**: Pressione botão (Score aumenta)
4. **Cenário Crítico**: 
   - Aumente temperatura > 38°C
   - Diminua O₂ < 90%
   - Simule queda no MPU6050
   - Observe LED vermelho acender
   - Veja alertas no dashboard

## 🎉 Sucesso!

Se todos os itens do checklist estão ✅, seu sistema SeniorCare está funcionando perfeitamente!

O sistema agora monitora:
- 🌡️ Temperatura em tempo real
- 🫁 Saturação de oxigênio
- 🚨 Detecção de quedas  
- ✅ Check-ins manuais
- 📊 Health Score automático
- 🔴 Alertas visuais e no dashboard

**Parabéns! Você implementou com sucesso um sistema IoT completo para monitoramento de idosos! 🎊**
