const { readDB, addPresente, findPresenteByNome, initFirebase } = require('./firebase-helper');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Inicializar Firebase
    initFirebase();

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

            // Verificar se já existe um presente com esse nome
            const existe = await findPresenteByNome(nome.trim());
            if (existe) {
                return res.status(400).json({ error: 'Já existe um presente com esse nome' });
            }

            // Encontrar o maior ID
            const db = await readDB();
            const maxId = db.presentes.length > 0 
                ? Math.max(...db.presentes.map(p => p.id)) 
                : 0;

            // Criar novo presente
            const novoPresente = {
                id: maxId + 1,
                nome: nome.trim(),
                status: 'disponivel',
                pessoa: null,
                dataConfirmacao: null
            };

            // Adicionar presente no Firebase
            await addPresente(novoPresente);

            return res.status(200).json({ 
                success: true, 
                message: 'Presente adicionado com sucesso!',
                presente: novoPresente
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.error('Erro:', error);
        const errorMessage = error.message || 'Erro interno do servidor';
        return res.status(500).json({ error: errorMessage });
    }
};
