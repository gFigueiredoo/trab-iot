# Exemplo de Configuração Rápida

Este arquivo contém exemplos práticos para configuração rápida do projeto.

## ⚡ Configuração Express (5 minutos)

### 1. Firebase - Configuração Mínima

Após criar seu projeto no Firebase:

```javascript
// Cole estas linhas no frontend/index.html (linha ~89)
const firebaseConfig = {
    apiKey: "AIzaSyC...", // Sua API Key aqui
    authDomain: "meu-esp32.firebaseapp.com",
    databaseURL: "https://meu-esp32-default-rtdb.firebaseio.com/",
    projectId: "meu-esp32",
    storageBucket: "meu-esp32.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

### 2. ESP32 - Configuração Mínima

```cpp
// Cole estas linhas no esp32/esp32_firebase_led.ino (linhas 5-9)
const char* ssid = "MinhaRede";
const char* password = "12345678";
const char* firebase_host = "https://meu-esp32-default-rtdb.firebaseio.com/";
const char* firebase_auth = "AIzaSyC..."; // Mesma API Key do frontend
```

## 🔧 Diagrama de Conexão

```
Internet
   ↕
Firebase Realtime Database
   ↕
[ESP32] ←→ [LED GPIO2]
   ↕
WiFi Router
   ↕
[Computador] → [Navegador Web]
```

## 📋 Checklist de Teste

### Preparação
- [ ] Conta Google criada
- [ ] Arduino IDE instalado
- [ ] ESP32 conectado via USB
- [ ] WiFi 2.4GHz disponível

### Firebase
- [ ] Projeto criado no Firebase Console
- [ ] Realtime Database ativado
- [ ] Regras de segurança configuradas
- [ ] Credenciais copiadas

### ESP32
- [ ] Biblioteca ArduinoJson instalada
- [ ] Código atualizado com credenciais
- [ ] Upload realizado com sucesso
- [ ] Serial Monitor mostra "WiFi conectado!"

### Frontend
- [ ] Arquivo index.html atualizado
- [ ] Página abre no navegador
- [ ] Status mostra "Conectado"
- [ ] Botões respondem ao clique

### Teste Final
- [ ] Clicar "LIGAR LED" → LED acende
- [ ] Clicar "DESLIGAR LED" → LED apaga
- [ ] Serial Monitor mostra comandos
- [ ] Firebase Console mostra mudanças

## ⚠️ Problemas Comuns e Soluções

### "WiFi desconectado!"
```cpp
// Adicione esta linha após WiFi.begin():
WiFi.setAutoReconnect(true);
```

### "Erro na requisição HTTP: -1"
- Verifique se a URL do Firebase está completa
- Confirme que inclui `https://` no início

### "Failed to connect to Firebase"
- Teste a URL no navegador
- Verifique se as regras de segurança estão corretas

### LED não acende
- Confirme que está usando GPIO2
- Teste com um LED externo se necessário:
  ```
  ESP32 GPIO2 → Resistor 220Ω → LED → GND
  ```

## 🚀 Teste Rápido Via Browser

1. Abra o Firebase Console
2. Vá para Realtime Database
3. Adicione manualmente: `led_status: true`
4. Observe o LED no ESP32
5. Mude para `false` e observe novamente

## 📱 URLs de Teste

Substitua `SEU_PROJETO_ID` pelo seu ID real:

- **Database**: `https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/led_status.json`
- **Console**: `https://console.firebase.google.com/project/SEU_PROJETO_ID`

## 🔍 Códigos de Status HTTP

- **200**: Sucesso
- **401**: Não autorizado (verifique API Key)
- **404**: URL não encontrada
- **-1**: Sem conexão internet

## ⏱️ Timeline Esperado

- **0-2 min**: Criar projeto Firebase
- **2-3 min**: Configurar Realtime Database
- **3-4 min**: Copiar credenciais
- **4-5 min**: Atualizar códigos
- **5+ min**: Upload e teste

Total: ~10 minutos para primeira execução