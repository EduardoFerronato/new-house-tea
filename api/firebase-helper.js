// Helper para gerenciar Firebase Firestore
const admin = require('firebase-admin');

let db = null;

// Inicializar Firebase
function initFirebase() {
    if (db) {
        return db; // Já inicializado
    }

    try {
        // Pegar credenciais da variável de ambiente
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        
        if (!serviceAccount) {
            console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT não configurada. Usando modo JSON fallback.');
            return null;
        }

        // Parse da string JSON
        let credentials;
        if (typeof serviceAccount === 'string') {
            credentials = JSON.parse(serviceAccount);
        } else {
            credentials = serviceAccount;
        }

        // Inicializar Firebase Admin
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(credentials)
            });
        }

        db = admin.firestore();
        console.log('✅ Firebase conectado');
        return db;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        return null;
    }
}

// Ler todos os presentes
async function readDB() {
    const firestore = initFirebase();
    
    if (!firestore) {
        // Fallback: retornar array vazio se Firebase não estiver configurado
        return { presentes: [] };
    }

    try {
        const collection = firestore.collection('presentes');
        const snapshot = await collection.get();
        
        const presentes = [];
        snapshot.forEach(doc => {
            presentes.push(doc.data());
        });
        
        return { presentes };
    } catch (error) {
        console.error('Erro ao ler do Firestore:', error);
        return { presentes: [] };
    }
}

// Salvar presentes no Firestore
async function writeDB(data) {
    const firestore = initFirebase();
    
    if (!firestore) {
        throw new Error('Firebase não configurado. Configure FIREBASE_SERVICE_ACCOUNT na Vercel.');
    }

    try {
        const collection = firestore.collection('presentes');
        const batch = firestore.batch();
        
        // Limpar coleção existente (opcional - pode comentar se não quiser limpar)
        // const snapshot = await collection.get();
        // snapshot.forEach(doc => {
        //     batch.delete(doc.ref);
        // });
        
        // Adicionar/atualizar cada presente
        for (const presente of data.presentes) {
            const docRef = collection.doc(String(presente.id)); // ID como string para o documento
            batch.set(docRef, presente);
        }
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error('Erro ao escrever no Firestore:', error);
        throw error;
    }
}

// Adicionar um presente
async function addPresente(presente) {
    const firestore = initFirebase();
    
    if (!firestore) {
        throw new Error('Firebase não configurado.');
    }

    try {
        const collection = firestore.collection('presentes');
        const docRef = collection.doc(String(presente.id));
        await docRef.set(presente);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar presente:', error);
        throw error;
    }
}

// Atualizar um presente
async function updatePresente(id, updates) {
    const firestore = initFirebase();
    
    if (!firestore) {
        throw new Error('Firebase não configurado.');
    }

    try {
        const collection = firestore.collection('presentes');
        const docRef = collection.doc(String(id));
        await docRef.update(updates);
        return true;
    } catch (error) {
        console.error('Erro ao atualizar presente:', error);
        throw error;
    }
}

// Deletar um presente
async function deletePresente(id) {
    const firestore = initFirebase();
    
    if (!firestore) {
        throw new Error('Firebase não configurado.');
    }

    try {
        const collection = firestore.collection('presentes');
        const docRef = collection.doc(String(id));
        await docRef.delete();
        return true;
    } catch (error) {
        console.error('Erro ao deletar presente:', error);
        throw error;
    }
}

// Buscar presente por nome (case-insensitive)
async function findPresenteByNome(nome) {
    const firestore = initFirebase();
    
    if (!firestore) {
        return null;
    }

    try {
        const collection = firestore.collection('presentes');
        // Buscar todos e filtrar localmente para case-insensitive
        const snapshot = await collection.get();
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.nome && data.nome.toLowerCase() === nome.toLowerCase()) {
                return data;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar presente:', error);
        return null;
    }
}

// Buscar presente por ID
async function findPresenteById(id) {
    const firestore = initFirebase();
    
    if (!firestore) {
        return null;
    }

    try {
        const collection = firestore.collection('presentes');
        const doc = await collection.doc(String(id)).get();
        
        if (!doc.exists) {
            return null;
        }
        
        return doc.data();
    } catch (error) {
        console.error('Erro ao buscar presente por ID:', error);
        return null;
    }
}

module.exports = {
    readDB,
    writeDB,
    addPresente,
    updatePresente,
    deletePresente,
    findPresenteByNome,
    findPresenteById,
    initFirebase
};

