// Versão com MongoDB - para usar na Vercel
// Para usar esta versão, renomeie este arquivo para presentes.js
// e configure a variável de ambiente MONGODB_URI na Vercel

const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI não configurada. Configure na Vercel.');
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('new-house-tea');
    
    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { client, db } = await connectToDatabase();
        const collection = db.collection('presentes');

        if (req.method === 'GET') {
            const presentes = await collection.find({}).sort({ nome: 1 }).toArray();
            return res.status(200).json(presentes);
        }

        if (req.method === 'POST') {
            const { nome } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({ error: 'Nome do presente é obrigatório' });
            }

            // Verificar se já existe
            const existe = await collection.findOne({ 
                nome: { $regex: new RegExp(`^${nome.trim()}$`, 'i') } 
            });

            if (existe) {
                return res.status(400).json({ error: 'Já existe um presente com esse nome' });
            }

            // Encontrar o maior ID
            const maxDoc = await collection.findOne({}, { sort: { id: -1 } });
            const maxId = maxDoc ? maxDoc.id : 0;

            const novoPresente = {
                id: maxId + 1,
                nome: nome.trim(),
                status: 'disponivel',
                pessoa: null,
                dataConfirmacao: null
            };

            await collection.insertOne(novoPresente);

            return res.status(200).json({
                success: true,
                message: 'Presente adicionado com sucesso!',
                presente: novoPresente
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ 
            error: error.message || 'Erro interno do servidor' 
        });
    }
};

