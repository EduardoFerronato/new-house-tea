// Script para migrar dados do db.json para MongoDB
// Execute: node migrar-dados.js

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function migrarDados() {
    // Lê a connection string da variável de ambiente ou pede para o usuário
    const uri = process.env.MONGODB_URI || process.argv[2];
    
    if (!uri || uri.includes('<db_password>')) {
        console.error('❌ Erro: Você precisa fornecer a connection string do MongoDB.');
        console.log('\nUso: node migrar-dados.js "mongodb+srv://usuario:senha@cluster..."');
        console.log('Ou configure a variável de ambiente MONGODB_URI');
        process.exit(1);
    }

    try {
        console.log('🔄 Conectando ao MongoDB...');
        const client = new MongoClient(uri);
        await client.connect();
        console.log('✅ Conectado ao MongoDB');

        const db = client.db('new-house-tea');
        const collection = db.collection('presentes');

        // Ler dados do db.json
        console.log('📖 Lendo db.json...');
        const dbFile = path.join(__dirname, 'db.json');
        const data = await fs.readFile(dbFile, 'utf8');
        const dbData = JSON.parse(data);

        if (!dbData.presentes || dbData.presentes.length === 0) {
            console.log('⚠️ Nenhum presente encontrado no db.json');
            await client.close();
            return;
        }

        console.log(`📦 Encontrados ${dbData.presentes.length} presentes para migrar`);

        // Limpar coleção existente (opcional)
        const existing = await collection.countDocuments();
        if (existing > 0) {
            console.log(`⚠️ Encontrados ${existing} documentos existentes na coleção`);
            console.log('💡 Adicionando novos dados...');
        }

        // Inserir ou atualizar presentes
        let inseridos = 0;
        let atualizados = 0;

        for (const presente of dbData.presentes) {
            const result = await collection.updateOne(
                { id: presente.id },
                { $set: presente },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                inseridos++;
            } else {
                atualizados++;
            }
        }

        console.log(`\n✅ Migração concluída!`);
        console.log(`   📥 Inseridos: ${inseridos}`);
        console.log(`   🔄 Atualizados: ${atualizados}`);
        console.log(`   📊 Total na coleção: ${await collection.countDocuments()}`);

        await client.close();
        console.log('\n✨ Pronto! Seus dados estão no MongoDB.');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error.message);
        process.exit(1);
    }
}

migrarDados();

