const { readDB, writeDB, ensureMongoDB, getMongoDb } = require('./db-helper');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Inicializar MongoDB se disponível
    await ensureMongoDB();

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
            
            const mongoDb = getMongoDb();
            
            // Verificar se já existe um presente com esse nome
            if (mongoDb) {
                const collection = mongoDb.collection('presentes');
                const existe = await collection.findOne({ 
                    nome: { $regex: new RegExp(`^${nome.trim()}$`, 'i') } 
                });
                if (existe) {
                    return res.status(400).json({ error: 'Já existe um presente com esse nome' });
                }
            } else {
                // Verificação local para JSON
                const existe = db.presentes.some(p => p.nome.toLowerCase() === nome.trim().toLowerCase());
                if (existe) {
                    return res.status(400).json({ error: 'Já existe um presente com esse nome' });
                }
            }

            // Encontrar o maior ID
            let maxId = 0;
            if (mongoDb) {
                const collection = mongoDb.collection('presentes');
                const maxDoc = await collection.findOne({}, { sort: { id: -1 } });
                maxId = maxDoc ? maxDoc.id : 0;
            } else {
                maxId = db.presentes.length > 0 
                    ? Math.max(...db.presentes.map(p => p.id)) 
                    : 0;
            }

            // Criar novo presente
            const novoPresente = {
                id: maxId + 1,
                nome: nome.trim(),
                status: 'disponivel',
                pessoa: null,
                dataConfirmacao: null
            };

            // Adicionar presente
            if (mongoDb) {
                const collection = mongoDb.collection('presentes');
                await collection.insertOne(novoPresente);
            } else {
                db.presentes.push(novoPresente);
            }

            try {
                const saved = await writeDB(db);
                
                if (saved) {
                    return res.status(200).json({ 
                        success: true, 
                        message: 'Presente adicionado com sucesso!',
                        presente: novoPresente
                    });
                } else {
                    return res.status(500).json({ 
                        error: 'Erro ao salvar no banco de dados. O sistema de arquivos pode ser read-only.' 
                    });
                }
            } catch (writeError) {
                console.error('Erro ao escrever:', writeError);
                // Se o erro for de sistema de arquivos read-only
                if (writeError.message && writeError.message.includes('read-only')) {
                    return res.status(500).json({ 
                        error: '⚠️ Sistema de arquivos é read-only na Vercel. Para produção, você precisa usar um banco de dados real (MongoDB, Supabase, etc.). As alterações não serão salvas permanentemente.' 
                    });
                }
                throw writeError; // Re-lança outros erros
            }
        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.error('Erro:', error);
        // Retornar mensagem de erro mais descritiva
        const errorMessage = error.message || 'Erro interno do servidor';
        return res.status(500).json({ error: errorMessage });
    }
};

