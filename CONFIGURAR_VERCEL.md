# ⚙️ Como Adicionar Firebase na Vercel - Passo a Passo

## 📋 Você já tem a chave do Firebase!

Agora você só precisa adicionar na Vercel:

### 🔧 Passo a Passo:

1. **Acesse a Vercel:**
   - Vá em: https://vercel.com
   - Faça login na sua conta
   - Vá para seu projeto `new-house-tea` (ou o nome que você deu)

2. **Vá em Settings:**
   - No menu do projeto, clique em **"Settings"**

3. **Vá em Environment Variables:**
   - No menu lateral esquerdo, clique em **"Environment Variables"**

4. **Adicione a Variável:**
   - Clique no botão **"Add New"** ou **"Adicionar Nova"**

5. **Preencha os campos:**
   - **Key (Chave):** `FIREBASE_SERVICE_ACCOUNT`
   - **Value (Valor):** Cole TODO o conteúdo do JSON da chave que você tem
     - Abra o arquivo JSON que você baixou do Firebase
     - Copie TODO o conteúdo (desde o `{` inicial até o `}` final)
     - Cole exatamente como está (com todas as aspas, quebras de linha, etc.)
     - **IMPORTANTE**: O JSON deve estar em uma única linha ou mantenha a formatação original
   - **Environments (Ambientes):** Marque TODAS as opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - **Environments (Ambientes):** Marque TODAS as opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

6. **Salve:**
   - Clique no botão **"Save"** ou **"Salvar"**

7. **Faça um novo Deploy:**
   - Vá em **"Deployments"** (no topo)
   - Clique nos **"..."** (três pontos) no último deployment
   - Clique em **"Redeploy"**
   - Ou aguarde o deploy automático (se o GitHub estiver conectado)

## ✅ Pronto!

Depois do deploy:
- O Firebase estará configurado
- Todas as operações funcionarão na Vercel
- Dados serão salvos no Firestore

## ⚠️ IMPORTANTE - Segurança:

⚠️ **ATENÇÃO**: Você compartilhou sua chave privada aqui. Por segurança:

1. **Revogue essa chave depois** (se possível):
   - Firebase Console → Settings → Service Accounts
   - Gere uma nova chave se necessário

2. **Não compartilhe essa chave publicamente**
3. **Não coloque no GitHub** (já está no .gitignore)

## 🔄 Migrar Dados (Opcional):

Se você tem dados no `db.json` e quer migrar:

```bash
# Configure a variável localmente primeiro
$env:FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Execute o script de migração
node migrar-firebase.js
```

Ou passe o caminho do arquivo JSON:
```bash
node migrar-firebase.js "caminho/para/arquivo.json"
```

