# 🔧 Troubleshooting - Erros na Vercel

## Erros Comuns e Soluções

### 1. ❌ "Module not found" ou "Cannot find module"

**Causa:** Dependências não instaladas ou caminhos incorretos.

**Solução:**
- Certifique-se de que todas as dependências estão no `package.json`
- A Vercel instala automaticamente as dependências, mas verifique se não há dependências faltando

### 2. ❌ "EROFS: read-only file system" ou "EACCES: permission denied"

**Causa:** A Vercel usa sistema de arquivos **read-only** em produção. Não é possível escrever no `db.json`.

**Solução:**
⚠️ **IMPORTANTE:** Para produção, você PRECISA usar um banco de dados real:
- MongoDB Atlas (gratuito)
- Supabase (gratuito)
- Firebase Firestore (gratuito)
- Vercel KV (Key-Value store)

### 3. ❌ "404 Not Found" nas rotas da API

**Causa:** Configuração incorreta do `vercel.json` ou estrutura de pastas.

**Solução:**
- Verifique se a pasta `api/` existe
- Verifique se os arquivos estão nomeados corretamente:
  - `api/presentes.js`
  - `api/confirmar.js`
  - `api/presentes/[id].js`
  - `api/resetar/[id].js`

### 4. ❌ "Function exceeded maximum duration"

**Causa:** Função serverless demorando muito para executar.

**Solução:**
- Otimize o código
- Use um banco de dados real em vez de ler/escrever arquivos

### 5. ❌ Erro de CORS

**Causa:** Headers CORS não configurados corretamente.

**Solução:**
- Verifique se todas as funções têm os headers CORS configurados
- Exemplo:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## 📋 Checklist antes do Deploy

- [ ] Todas as dependências estão no `package.json`
- [ ] Pasta `api/` existe com todas as funções
- [ ] `vercel.json` está configurado corretamente
- [ ] `db.json` existe na raiz do projeto
- [ ] URLs no frontend usam caminhos relativos (sem localhost:3001)

## 🚀 Como verificar logs na Vercel

1. Acesse o dashboard da Vercel
2. Vá em seu projeto
3. Clique em "Functions" ou "Deployments"
4. Veja os logs de erro

## 💡 Solução Recomendada para Produção

Para um projeto em produção, **NÃO use arquivo JSON**. Use um banco de dados real:

### Opção 1: MongoDB Atlas (Recomendado)
```bash
npm install mongodb
```

### Opção 2: Supabase (PostgreSQL)
```bash
npm install @supabase/supabase-js
```

### Opção 3: Vercel KV
```bash
npm install @vercel/kv
```

## 📞 Precisa de ajuda?

Se o erro persistir, compartilhe:
1. A mensagem de erro completa
2. Os logs da Vercel (Functions > Logs)
3. Qual função está falhando

