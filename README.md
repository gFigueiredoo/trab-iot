# Projeto IoT: Controle de LED com ESP32 e Firebase

Este projeto demonstra como criar um sistema IoT simples onde você pode controlar um LED conectado ao ESP32 através de uma página web, usando Firebase Realtime Database como intermediário.

## 📋 Funcionalidades

- ✅ Interface web responsiva para controlar LED
- ✅ Comunicação em tempo real via Firebase
- ✅ ESP32 conectado ao WiFi
- ✅ Controle de LED integrado do ESP32
- ✅ Status visual em tempo real

## 🏗️ Estrutura do Projeto

```
trab-iot/
├── README.md                          # Este arquivo
├── esp32/
│   └── esp32_firebase_led.ino        # Código Arduino para ESP32
├── frontend/
│   └── index.html                     # Interface web
└── docs/
    └── firebase-setup.md              # Guia de configuração do Firebase
```

## 🔧 Componentes Necessários

### Hardware
- 1x ESP32 (qualquer modelo)
- 1x Cabo USB para programação
- 1x LED interno (GPIO2) - já integrado no ESP32

### Software
- Arduino IDE
- Navegador web moderno
- Conta Google (para Firebase)

## 📚 Bibliotecas Necessárias

Para o ESP32, instale as seguintes bibliotecas no Arduino IDE:

1. **WiFi** (já incluída no ESP32)
2. **HTTPClient** (já incluída no ESP32)
3. **ArduinoJson** - Instalar via Library Manager

### Como instalar ArduinoJson:
1. Abra Arduino IDE
2. Vá em `Sketch` > `Include Library` > `Manage Libraries`
3. Pesquise por "ArduinoJson"
4. Instale a versão 6.x.x

## 🚀 Como Usar

### Passo 1: Configurar Firebase
1. Siga o guia detalhado em [`docs/firebase-setup.md`](docs/firebase-setup.md)
2. Anote suas credenciais do Firebase

### Passo 2: Configurar ESP32
1. Abra `esp32/esp32_firebase_led.ino` no Arduino IDE
2. Substitua as configurações:
   ```cpp
   const char* ssid = "SEU_WIFI_SSID";
   const char* password = "SUA_SENHA_WIFI";
   const char* firebase_host = "https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/";
   const char* firebase_auth = "SUA_API_KEY";
   ```
3. Conecte o ESP32 via USB
4. Selecione a placa correta em `Tools` > `Board` > `ESP32`
5. Selecione a porta correta em `Tools` > `Port`
6. Clique em `Upload` (ícone da seta)

### Passo 3: Configurar Frontend
1. Abra `frontend/index.html` em um editor de texto
2. Substitua a configuração do Firebase:
   ```javascript
   const firebaseConfig = {
       apiKey: "SUA_API_KEY",
       authDomain: "SEU_PROJETO.firebaseapp.com",
       databaseURL: "https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/",
       projectId: "SEU_PROJETO_ID",
       storageBucket: "SEU_PROJETO.appspot.com",
       messagingSenderId: "123456789",
       appId: "SUA_APP_ID"
   };
   ```

### Passo 4: Testar o Sistema
1. Abra o Serial Monitor no Arduino IDE (115200 baud)
2. Verifique se o ESP32 conectou ao WiFi
3. Abra `frontend/index.html` em um navegador
4. Clique nos botões para ligar/desligar o LED
5. Observe o LED no ESP32 e as mensagens no Serial Monitor

## 📱 Como Funciona

1. **Frontend** → Envia comando para Firebase quando botão é clicado
2. **Firebase** → Armazena o estado do LED (`led_status: true/false`)
3. **ESP32** → Monitora mudanças no Firebase a cada 1 segundo
4. **ESP32** → Liga/desliga o LED baseado no valor recebido

## 🔍 Monitoramento

### Serial Monitor (ESP32)
```
Conectando ao WiFi.....
WiFi conectado!
IP address: 192.168.1.100
Resposta do Firebase: true
LED LIGADO
Resposta do Firebase: false
LED DESLIGADO
```

### Firebase Console
Você pode visualizar as mudanças em tempo real acessando:
`Firebase Console` > `Realtime Database`

### Browser Console
Abra as ferramentas de desenvolvedor (F12) para ver logs detalhados.

## 🛠️ Solução de Problemas

### ESP32 não conecta ao WiFi
- Verifique SSID e senha
- Certifique-se que o WiFi é 2.4GHz (ESP32 não suporta 5GHz)
- Verifique se o WiFi não tem portal captivo

### Erro HTTP no ESP32
- Confirme a URL do Firebase
- Verifique se a API Key está correta
- Teste a URL manualmente no navegador

### Frontend não funciona
- Abra o console do navegador (F12)
- Verifique se há erros de configuração
- Confirme se todas as credenciais estão corretas

### LED não responde
- Verifique conexões físicas
- Confirme se está usando GPIO2
- Verifique se o código foi carregado corretamente

## 📈 Próximos Passos

Para expandir este projeto, você pode:

- [ ] Adicionar mais sensores (temperatura, umidade)
- [ ] Implementar autenticação de usuário
- [ ] Criar um aplicativo móvel
- [ ] Adicionar controle de múltiplos dispositivos
- [ ] Implementar notificações push
- [ ] Criar gráficos de histórico de dados

## 🤝 Contribuições

Sinta-se à vontade para fazer fork deste projeto e contribuir com melhorias!

## 📄 Licença

Este projeto está sob licença MIT. Veja detalhes no arquivo LICENSE.

---

**Desenvolvido para fins educacionais** 📚
