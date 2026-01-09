// Helper para gerenciar banco de dados (MongoDB ou JSON)
const fs = require('fs').promises;
const path = require('path');

let mongoClient = null;
let mongoDb = null;

// Verificar se MongoDB está configurado
async function initMongoDB() {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            mongoDb = client.db('new-house-tea');
            mongoClient = client;
            console.log('✅ MongoDB conectado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar MongoDB:', error);
            return false;
        }
    }
    return false;
}

// Ler do banco (MongoDB ou JSON)
async function readDB() {
    // Tentar MongoDB primeiro
    if (mongoDb) {
        try {
            const collection = mongoDb.collection('presentes');
            const presentes = await collection.find({}).toArray();
            return { presentes };
        } catch (error) {
            console.error('Erro ao ler do MongoDB:', error);
        }
    }

    // Fallback para JSON
    try {
        const DB_FILE = path.join(__dirname, '..', 'db.json');
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler db.json:', error);
        return { presentes: [] };
    }
}

// Salvar no banco (MongoDB ou JSON)
async function writeDB(data) {
    // Tentar MongoDB primeiro
    if (mongoDb) {
        try {
            const collection = mongoDb.collection('presentes');
            
            // Atualizar ou inserir cada presente
            for (const presente of data.presentes) {
                await collection.updateOne(
                    { id: presente.id },
                    { $set: presente },
                    { upsert: true }
                );
            }
            console.log('✅ Dados salvos no MongoDB');
            return true;
        } catch (error) {
            console.error('Erro ao salvar no MongoDB:', error);
            return false;
        }
    }

    // Fallback para JSON (pode falhar na Vercel)
    try {
        const DB_FILE = path.join(__dirname, '..', 'db.json');
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao escrever db.json:', error);
        if (error.code === 'EROFS' || error.code === 'EACCES') {
            throw new Error('⚠️ Sistema de arquivos é read-only na Vercel. Configure MongoDB para produção.');
        }
        return false;
    }
}

// Inicializar MongoDB na primeira vez
let mongoInitPromise = null;
async function ensureMongoDB() {
    if (!mongoInitPromise) {
        mongoInitPromise = initMongoDB();
    }
    await mongoInitPromise;
}

function getMongoDb() {
    return mongoDb;
}

module.exports = {
    readDB,
    writeDB,
    ensureMongoDB,
    getMongoDb
};

