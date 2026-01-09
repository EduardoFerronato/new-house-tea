const fs = require('fs').promises;
const path = require('path');

// Função auxiliar para ler o banco de dados
async function readDB() {
    try {
        // Na Vercel, o arquivo está na raiz do projeto
        const DB_FILE = path.join(__dirname, '..', 'db.json');
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler db.json:', error);
        return { presentes: [] };
    }
}

// Função auxiliar para salvar no banco de dados
async function writeDB(data) {
    try {
        // Na Vercel, o arquivo está na raiz do projeto
        const DB_FILE = path.join(__dirname, '..', 'db.json');
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao escrever db.json:', error);
        return false;
    }
}

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Buscar todos os presentes
            const db = await readDB();
            db.presentes.sort((a, b) => a.nome.localeCompare(b.nome));
            return res.status(200).json(db.presentes);
        }

        if (req.method === 'POST') {
            // Adicionar novo presente
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
                return res.status(200).json({ 
                    success: true, 
                    message: 'Presente adicionado com sucesso!',
                    presente: novoPresente
                });
            } else {
                return res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
            }
        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

