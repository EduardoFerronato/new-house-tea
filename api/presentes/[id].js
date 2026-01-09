const fs = require('fs').promises;
const path = require('path');

// Função auxiliar para ler o banco de dados
async function readDB() {
    try {
        const DB_FILE = path.join(__dirname, '..', '..', 'db.json');
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
        const DB_FILE = path.join(__dirname, '..', '..', 'db.json');
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
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { id } = req.query;
        const idNum = parseInt(id);

        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const db = await readDB();
        
        const presenteIndex = db.presentes.findIndex(p => p.id === idNum);
        
        if (presenteIndex === -1) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        db.presentes.splice(presenteIndex, 1);

        try {
            const saved = await writeDB(db);

            if (saved) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Presente removido com sucesso!'
                });
            } else {
                return res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
            }
        } catch (writeError) {
            console.error('Erro ao escrever:', writeError);
            if (writeError.message && writeError.message.includes('read-only')) {
                return res.status(500).json({ 
                    error: '⚠️ Sistema de arquivos é read-only na Vercel. Para produção, você precisa usar um banco de dados real.' 
                });
            }
            throw writeError;
        }
    } catch (error) {
        console.error('Erro ao remover presente:', error);
        const errorMessage = error.message || 'Erro ao remover presente';
        return res.status(500).json({ error: errorMessage });
    }
};

