const { readDB, writeDB, ensureMongoDB, getMongoDb } = require('../db-helper');

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
        // Na Vercel, o ID vem de req.query.id quando usando [id].js
        const id = req.query.id || req.url.split('/').pop();
        const idNum = parseInt(id);

        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const mongoDb = getMongoDb();
        
        if (mongoDb) {
            // Usar MongoDB
            const collection = mongoDb.collection('presentes');
            const result = await collection.updateOne(
                { id: idNum },
                { 
                    $set: {
                        status: 'disponivel',
                        pessoa: null,
                        dataConfirmacao: null
                    }
                }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Presente não encontrado' });
            }
            
            const presente = await collection.findOne({ id: idNum });
            
            return res.status(200).json({ 
                success: true, 
                message: 'Presente resetado com sucesso!',
                presente: presente
            });
        } else {
            // Usar JSON
            const db = await readDB();
            
            const presenteIndex = db.presentes.findIndex(p => p.id === idNum);
            
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

            try {
                const saved = await writeDB(db);

            if (saved) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Presente resetado com sucesso!',
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
        console.error('Erro ao resetar presente:', error);
        const errorMessage = error.message || 'Erro ao resetar presente';
        return res.status(500).json({ error: errorMessage });
    }
};

