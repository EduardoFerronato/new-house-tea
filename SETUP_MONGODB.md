# 🗄️ Configuração do MongoDB Atlas para Vercel

## Passo a Passo

### 1. Criar conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Escolha o plano **FREE (M0)**

### 2. Criar um Cluster

1. Escolha a região mais próxima (ex: São Paulo)
2. Nome do cluster: `new-house-tea` (ou qualquer nome)
3. Clique em "Create Cluster"

### 3. Configurar Acesso ao Banco

1. Vá em **Security > Database Access**
2. Clique em "Add New Database User"
3. Escolha "Password" como método de autenticação
4. Crie um usuário e senha (GUARDE ESSES DADOS!)
5. Permissão: "Atlas admin"
6. Clique em "Add User"

### 4. Configurar Network Access

1. Vá em **Security > Network Access**
2. Clique em "Add IP Address"
3. Clique em "Allow Access from Anywhere" (0.0.0.0/0)
4. Clique em "Confirm"

### 5. Obter Connection String

1. Vá em **Clusters**
2. Clique em "Connect" no seu cluster
3. Escolha "Connect your application"
4. Copie a connection string (algo como: `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 6. Configurar na Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione uma nova variável:
   - **Key**: `MONGODB_URI`
   - **Value**: Cole a connection string que você copiou, mas SUBSTITUA `<password>` pela senha do usuário criado
   - Exemplo: `mongodb+srv://usuario:minhasenha123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. Clique em "Save"
5. Faça um novo deploy

### 7. Instalar dependência MongoDB

Adicione ao `package.json`:
```json
"dependencies": {
  "mongodb": "^6.0.0"
}
```

## ⚠️ Importante

- Mantenha a senha segura
- Não compartilhe a connection string publicamente
- Use variáveis de ambiente sempre

## Alternativa: Usar versão atual com arquivo JSON

Se preferir não usar MongoDB agora, você pode:
- Usar apenas localmente (`npm run server`)
- Ou aceitar que na Vercel será read-only (apenas leitura)

