# Configuração do Firebase Realtime Database

## Passo 1: Criar o Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Digite um nome para seu projeto (ex: `esp32-led-control`)
4. Aceite os termos e continue
5. Desabilite Google Analytics (não é necessário para este projeto)
6. Clique em "Criar projeto"

## Passo 2: Configurar o Realtime Database

1. No menu lateral esquerdo, clique em **"Realtime Database"**
2. Clique em **"Criar base de dados"** ou **"Create database"**
3. Escolha uma localização (recomendado: `us-central1`)
4. Selecione **"Começar no modo de teste"** (Start in test mode)
   - Isso permite leitura/escrita por 30 dias sem autenticação
5. Clique em **"Ativar"** ou **"Enable"**

## Passo 3: Configurar as Regras de Segurança

1. Ainda na página do Realtime Database, clique na aba **"Regras"** (Rules)
2. Substitua o conteúdo pelas seguintes regras:

```json
{
  "rules": {
    "led_status": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Clique em **"Publicar"** (Publish)

## Passo 4: Obter as Configurações

1. Clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Selecione **"Configurações do projeto"** (Project settings)
3. Role para baixo até a seção **"Seus aplicativos"**
4. Clique no ícone da web `</>`
5. Digite um nome para o app (ex: `esp32-web-control`)
6. **NÃO** marque a opção "Firebase Hosting"
7. Clique em **"Registrar app"**

## Passo 5: Copiar as Configurações

Você verá um código similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com/",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

## Passo 6: Atualizar os Arquivos do Projeto

### 6.1 Frontend (index.html)

Abra o arquivo `frontend/index.html` e substitua a seção `firebaseConfig` pelos seus dados:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "123456789",
    appId: "SUA_APP_ID_AQUI"
};
```

### 6.2 ESP32 (esp32_firebase_led.ino)

Abra o arquivo `esp32/esp32_firebase_led.ino` e atualize:

```cpp
// Configurações WiFi
const char* ssid = "NOME_DO_SEU_WIFI";
const char* password = "SENHA_DO_SEU_WIFI";

// Configurações Firebase
const char* firebase_host = "https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/";
const char* firebase_auth = "SUA_API_KEY_AQUI";
```

## Passo 7: Testar a Configuração

1. Acesse o Realtime Database no console do Firebase
2. Você deve ver a estrutura da base de dados vazia
3. Adicione manualmente um campo para teste:
   - Clique no `+` ao lado da raiz
   - Nome: `led_status`
   - Valor: `false` (boolean)
   - Clique em "Adicionar"

## URLs Importantes

- **Firebase Console**: https://console.firebase.google.com/
- **URL do seu Database**: `https://SEU_PROJETO_ID-default-rtdb.firebaseio.com/`
- **Documentação**: https://firebase.google.com/docs/database

## Notas de Segurança

⚠️ **IMPORTANTE**: As regras configuradas permitem acesso público ao seu database. Para produção, implemente autenticação adequada.

Para ambiente de desenvolvimento/teste, as regras atuais são suficientes, mas lembre-se de que qualquer pessoa com a URL pode acessar e modificar os dados.

## Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS no navegador:
1. Certifique-se de que está usando `https://` na configuração
2. Verifique se o domínio está autorizado nas configurações do Firebase

### Conexão ESP32 falha
1. Verifique se a API Key está correta
2. Confirme se a URL do database está completa e correta
3. Teste a conexão WiFi separadamente

### Dados não aparecem
1. Verifique se as regras de segurança estão configuradas
2. Confirme se o campo `led_status` existe no database
3. Verifique o console do navegador para erros JavaScript