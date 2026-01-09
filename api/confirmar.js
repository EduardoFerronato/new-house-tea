const { readDB, writeDB, ensureMongoDB, getMongoDb } = require('./db-helper');

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

    // Inicializar MongoDB se disponível
    await ensureMongoDB();

    try {
        const { nomePresente, nomePessoa } = req.body;

        if (!nomePresente || !nomePessoa) {
            return res.status(400).json({ error: 'Nome do presente e nome da pessoa são obrigatórios' });
        }

        const mongoDb = getMongoDb();
        
        if (mongoDb) {
            // Usar MongoDB
            const collection = mongoDb.collection('presentes');
            const presente = await collection.findOne({ nome: nomePresente });
            
            if (!presente) {
                return res.status(404).json({ error: 'Presente não encontrado' });
            }
            
            if (presente.status === 'confirmado') {
                return res.status(400).json({ error: 'Este presente já foi confirmado por outra pessoa' });
            }
            
            const updated = await collection.updateOne(
                { nome: nomePresente },
                {
                    $set: {
                        status: 'confirmado',
                        pessoa: nomePessoa.trim(),
                        dataConfirmacao: new Date().toISOString()
                    }
                }
            );
            
            const presenteAtualizado = await collection.findOne({ nome: nomePresente });
            
            return res.status(200).json({ 
                success: true, 
                message: 'Presente confirmado com sucesso!',
                presente: presenteAtualizado
            });
        } else {
            // Usar JSON
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

            try {
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
        } catch (writeError) {
            console.error('Erro ao escrever:', writeError);
            if (writeError.message && writeError.message.includes('read-only')) {
                return res.status(500).json({ 
                    error: '⚠️ Sistema de arquivos é read-only na Vercel. Para produção, você precisa usar um banco de dados real.' 
                });
            }
            throw writeError;
            }
        }
    } catch (error) {
        console.error('Erro ao confirmar presente:', error);
        const errorMessage = error.message || 'Erro ao confirmar presente';
        return res.status(500).json({ error: errorMessage });
    }
};

