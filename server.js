const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para tratamento de erros de parsing JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
    }
    next();
});

// Função para ler o banco de dados
async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler db.json:', error);
        return { presentes: [] };
    }
}

// Função para salvar no banco de dados
async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao escrever db.json:', error);
        return false;
    }
}

// Rota para buscar todos os presentes
app.get('/api/presentes', async (req, res) => {
    try {
        const db = await readDB();
        // Ordenar por nome
        db.presentes.sort((a, b) => a.nome.localeCompare(b.nome));
        res.json(db.presentes);
    } catch (error) {
        console.error('Erro ao buscar presentes:', error);
        res.status(500).json({ error: 'Erro ao buscar presentes' });
    }
});

// Rota para confirmar um presente
app.post('/api/presentes/confirmar', async (req, res) => {
    try {
        const { nomePresente, nomePessoa } = req.body;

        if (!nomePresente || !nomePessoa) {
            return res.status(400).json({ error: 'Nome do presente e nome da pessoa são obrigatórios' });
        }

        const db = await readDB();
        
        // Encontrar o presente pelo nome
        const presenteIndex = db.presentes.findIndex(p => p.nome === nomePresente);
        
        if (presenteIndex === -1) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        const presente = db.presentes[presenteIndex];

        // Verificar se já está confirmado
        if (presente.status === 'confirmado') {
            return res.status(400).json({ error: 'Este presente já foi confirmado por outra pessoa' });
        }

        // Atualizar o presente
        db.presentes[presenteIndex] = {
            ...presente,
            status: 'confirmado',
            pessoa: nomePessoa.trim(),
            dataConfirmacao: new Date().toISOString()
        };

        const saved = await writeDB(db);

        if (saved) {
            res.json({ 
                success: true, 
                message: 'Presente confirmado com sucesso!',
                presente: db.presentes[presenteIndex]
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
        }
    } catch (error) {
        console.error('Erro ao confirmar presente:', error);
        res.status(500).json({ error: 'Erro ao confirmar presente' });
    }
});

// Rota para adicionar um novo presente
app.post('/api/presentes', async (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).json({ error: 'Nome do presente é obrigatório' });
        }

        const db = await readDB();
        
        // Verificar se já existe um presente com esse nome
        const existe = db.presentes.some(p => p.nome.toLowerCase() === nome.trim().toLowerCase());
        if (existe) {
            return res.status(400).json({ error: 'Já existe um presente com esse nome' });
        }

        // Encontrar o maior ID
        const maxId = db.presentes.length > 0 
            ? Math.max(...db.presentes.map(p => p.id)) 
            : 0;

        // Criar novo presente
        const novoPresente = {
            id: maxId + 1,
            nome: nome.trim(),
            status: 'disponivel',
            pessoa: null,
            dataConfirmacao: null
        };

        db.presentes.push(novoPresente);

        const saved = await writeDB(db);

        if (saved) {
            res.json({ 
                success: true, 
                message: 'Presente adicionado com sucesso!',
                presente: novoPresente
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
        }
    } catch (error) {
        console.error('Erro ao adicionar presente:', error);
        res.status(500).json({ error: 'Erro ao adicionar presente' });
    }
});

// Rota para remover um presente
app.delete('/api/presentes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const db = await readDB();
        
        const presenteIndex = db.presentes.findIndex(p => p.id === id);
        
        if (presenteIndex === -1) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        db.presentes.splice(presenteIndex, 1);

        const saved = await writeDB(db);

        if (saved) {
            res.json({ 
                success: true, 
                message: 'Presente removido com sucesso!'
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
        }
    } catch (error) {
        console.error('Erro ao remover presente:', error);
        res.status(500).json({ error: 'Erro ao remover presente' });
    }
});

// Rota para resetar um presente (voltar para disponível)
app.post('/api/presentes/:id/resetar', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const db = await readDB();
        
        const presenteIndex = db.presentes.findIndex(p => p.id === id);
        
        if (presenteIndex === -1) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        // Resetar o presente
        db.presentes[presenteIndex] = {
            ...db.presentes[presenteIndex],
            status: 'disponivel',
            pessoa: null,
            dataConfirmacao: null
        };

        const saved = await writeDB(db);

        if (saved) {
            res.json({ 
                success: true, 
                message: 'Presente resetado com sucesso!',
                presente: db.presentes[presenteIndex]
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
        }
    } catch (error) {
        console.error('Erro ao resetar presente:', error);
        res.status(500).json({ error: 'Erro ao resetar presente' });
    }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware para tratamento de erros gerais
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Banco de dados: ${DB_FILE}`);
});
