# Deploy na Vercel

Este projeto está configurado para funcionar na Vercel.

## ⚠️ IMPORTANTE - Limitação do Sistema de Arquivos

**A Vercel usa um sistema de arquivos read-only em produção**, o que significa que o arquivo `db.json` **NÃO pode ser modificado** após o deploy.

### Soluções Recomendadas:

1. **Usar um banco de dados real** (recomendado para produção):
   - MongoDB Atlas (gratuito)
   - Supabase (gratuito)
   - Firebase Firestore (gratuito)
   - PlanetScale (gratuito)

2. **Usar Vercel KV** (Key-Value store da Vercel):
   - Mais simples que um banco completo
   - Gratuito até certo limite

3. **Para testes simples**: O projeto funcionará, mas as alterações não serão persistidas entre deploys.

## Como fazer o Deploy:

1. **Instale a CLI da Vercel** (se ainda não tiver):
   ```bash
   npm i -g vercel
   ```

2. **Faça login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   Ou conecte seu repositório GitHub na interface da Vercel.

## Estrutura do Projeto:

- `api/` - Serverless functions (backend)
- `index.html` - Página principal
- `App.jsx` - Componente principal
- `PaginaControle.jsx` - Página de controle
- `db.json` - Banco de dados (read-only na Vercel)

## URLs das APIs:

- `GET /api/presentes` - Listar presentes
- `POST /api/presentes` - Adicionar presente
- `POST /api/presentes/confirmar` - Confirmar presente
- `DELETE /api/presentes/:id` - Remover presente
- `POST /api/presentes/:id/resetar` - Resetar presente

## Desenvolvimento Local:

Para desenvolvimento local, continue usando:
```bash
npm run server  # Backend na porta 3001
npm run dev     # Frontend na porta 3000
```

