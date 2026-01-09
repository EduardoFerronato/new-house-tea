const fs = require('fs').promises;
const path = require('path');

// Função auxiliar para ler o banco de dados
async function readDB() {
    try {
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
        const DB_FILE = path.join(__dirname, '..', 'db.json');
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao escrever db.json:', error);
        if (error.code === 'EROFS' || error.code === 'EACCES' || error.message.includes('read-only')) {
            console.warn('⚠️ Sistema de arquivos é read-only na Vercel. Use um banco de dados real para produção.');
            throw new Error('Sistema de arquivos é read-only. Use um banco de dados real para produção.');
        }
        return false;
    }
}

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

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
            return res.status(200).json({ 
                success: true, 
                message: 'Presente confirmado com sucesso!',
                presente: db.presentes[presenteIndex]
            });
        } else {
            return res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
        }
    } catch (error) {
        console.error('Erro ao confirmar presente:', error);
        return res.status(500).json({ error: 'Erro ao confirmar presente' });
    }
};

