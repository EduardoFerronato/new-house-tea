# 🔥 Configuração do Firebase Firestore - Passo a Passo

## 📋 O que é o Firebase?

Firebase é uma plataforma da Google que oferece banco de dados em tempo real (Firestore) de forma gratuita até certo limite. É perfeito para este projeto!

## 🚀 Passo a Passo Completo

### 1️⃣ Criar Conta no Firebase

1. Acesse: **https://console.firebase.google.com/**
2. Clique em **"Começar"** ou **"Get Started"**
3. Faça login com sua conta Google (ou crie uma)

### 2️⃣ Criar um Novo Projeto

1. Clique no botão **"+ Adicionar projeto"** ou **"Add project"**
2. **Nome do projeto**: Digite `cha-de-casa-nova` (ou qualquer nome)
3. Clique em **"Continuar"**
4. **Google Analytics**: 
   - Pode desativar (não é obrigatório)
   - Ou deixar ativado se quiser
5. Clique em **"Criar projeto"** ou **"Create project"**
6. Aguarde alguns segundos enquanto o projeto é criado
7. Clique em **"Continuar"**

### 3️⃣ Ativar Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. **Modo de segurança**:
   - Selecione **"Começar no modo de teste"** (Start in test mode)
   - Isso permite ler/escrever por 30 dias (depois configuraremos regras)
4. Clique em **"Próximo"** ou **"Next"**
5. **Localização**:
   - Escolha a região mais próxima (ex: `southamerica-east1` - São Paulo)
   - Ou `us-central` se preferir
6. Clique em **"Ativar"** ou **"Enable"**
7. Aguarde alguns minutos enquanto o banco é criado

### 4️⃣ Criar Conta de Serviço (Service Account)

1. Clique no ícone de **engrenagem ⚙️** no canto superior esquerdo
2. Vá em **"Configurações do projeto"** ou **"Project settings"**
3. Vá na aba **"Contas de serviço"** ou **"Service accounts"**
4. Certifique-se de que está selecionado **"Node.js"** (já deve estar)
5. Clique no botão **"Gerar nova chave privada"** ou **"Generate new private key"**
6. Uma janela de confirmação aparecerá - clique em **"Gerar chave"** ou **"Generate key"**
7. Um arquivo JSON será baixado automaticamente (ex: `cha-de-casa-nova-firebase-adminsdk-xxxxx.json`)
8. **⚠️ IMPORTANTE**: Guarde este arquivo em segurança, mas NÃO o coloque no Git!

### 5️⃣ Obter as Configurações do Projeto

Ainda na tela de **"Configurações do projeto"**:

1. Vá na aba **"Geral"** (primeira aba)
2. Role a página até encontrar **"Seus apps"** ou **"Your apps"**
3. Procure por uma seção que mostra as credenciais do projeto (não precisa criar um app web)
4. Anote ou copie:
   - **Project ID**: algo como `cha-de-casa-nova-xxxxx`
   - Ou copie o conteúdo do arquivo JSON que você baixou

### 6️⃣ Configurar na Vercel

1. Abra o arquivo JSON que você baixou (o arquivo da chave privada)
   - Exemplo: `cha-de-casa-nova-firebase-adminsdk-xxxxx.json`
2. Copie TODO o conteúdo do arquivo JSON (todo o texto dentro do arquivo)
3. Acesse seu projeto na **Vercel**
4. Vá em **Settings** → **Environment Variables**
5. Clique em **"Add New"**
6. Adicione a variável:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Cole TODO o conteúdo do arquivo JSON completo (desde `{` até `}`)
     - Exemplo de como deve estar: `{"type":"service_account","project_id":"cha-de-casa-nova-xxxxx",...}`
   - **Environments**: Marque todas (Production, Preview, Development)
7. Clique em **"Save"**
8. Faça um novo deploy (ou aguarde o automático)

### 7️⃣ Estrutura do Firestore

O Firestore cria automaticamente as coleções quando você inserir dados. Não precisa criar nada manualmente!

A estrutura será:
```
presentes (collection)
  ├── documento1
  │   ├── id: 1
  │   ├── nome: "Micro-ondas"
  │   ├── status: "disponivel"
  │   ├── pessoa: null
  │   └── dataConfirmacao: null
  ├── documento2
  │   └── ...
```

## ✅ Pronto!

Depois de configurar:
- O código já está preparado para usar Firebase
- As funções criarão a coleção `presentes` automaticamente
- Tudo funcionará na Vercel!

## 🔐 Regras de Segurança (Opcional - Para depois)

Depois que tudo estiver funcionando, você pode configurar regras de segurança:

1. Vá em **Firestore Database** → **Regras** ou **Rules**
2. Substitua por:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /presentes/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
3. Clique em **Publicar** ou **Publish**

⚠️ **Nota**: Essas regras permitem leitura/escrita para todos. Para produção, você pode restringir depois.

## 📊 Migrar Dados Existentes

Se você tem dados no `db.json`, pode migrá-los usando o script:
```bash
node migrar-firebase.js
```

## 🆘 Precisa de Ajuda?

- Firebase Console: https://console.firebase.google.com/
- Documentação: https://firebase.google.com/docs/firestore

