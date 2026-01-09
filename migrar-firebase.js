// Script para migrar dados do db.json para Firebase Firestore
// Execute: node migrar-firebase.js

const fs = require('fs').promises;
const path = require('path');
const { addPresente, initFirebase } = require('./api/firebase-helper');

// Configurar Firebase localmente
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error('❌ Erro: Você precisa configurar FIREBASE_SERVICE_ACCOUNT');
    console.log('\nOpções:');
    console.log('1. Configure a variável de ambiente:');
    console.log('   $env:FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\'');
    console.log('\n2. Ou crie um arquivo .env.local com:');
    console.log('   FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\'');
    console.log('\n3. Ou passe como argumento:');
    console.log('   node migrar-firebase.js "caminho/para/arquivo-json-do-firebase.json"');
    process.exit(1);
}

async function migrarDados() {
    try {
        // Verificar se foi passado um arquivo JSON
        const jsonFile = process.argv[2];
        if (jsonFile && !process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log('📖 Lendo arquivo JSON do Firebase...');
            const jsonContent = await fs.readFile(jsonFile, 'utf8');
            process.env.FIREBASE_SERVICE_ACCOUNT = jsonContent;
        }

        console.log('🔄 Conectando ao Firebase...');
        initFirebase();
        console.log('✅ Conectado ao Firebase');

        // Ler dados do db.json
        console.log('📖 Lendo db.json...');
        const dbFile = path.join(__dirname, 'db.json');
        const data = await fs.readFile(dbFile, 'utf8');
        const dbData = JSON.parse(data);

        if (!dbData.presentes || dbData.presentes.length === 0) {
            console.log('⚠️ Nenhum presente encontrado no db.json');
            return;
        }

        console.log(`📦 Encontrados ${dbData.presentes.length} presentes para migrar`);

        // Migrar cada presente
        let sucesso = 0;
        let erros = 0;

        for (const presente of dbData.presentes) {
            try {
                await addPresente(presente);
                sucesso++;
                console.log(`✅ Migrado: ${presente.nome}`);
            } catch (error) {
                erros++;
                console.error(`❌ Erro ao migrar ${presente.nome}:`, error.message);
            }
        }

        console.log(`\n✅ Migração concluída!`);
        console.log(`   ✅ Sucesso: ${sucesso}`);
        console.log(`   ❌ Erros: ${erros}`);
        console.log(`   📊 Total: ${dbData.presentes.length}`);

        console.log('\n✨ Pronto! Seus dados estão no Firebase.');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error.message);
        process.exit(1);
    }
}

migrarDados();

