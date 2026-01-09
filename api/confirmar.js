const { findPresenteByNome, updatePresente, initFirebase } = require('./firebase-helper');

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

    // Inicializar Firebase
    initFirebase();

    try {
        const { nomePresente, nomePessoa } = req.body;

        if (!nomePresente || !nomePessoa) {
            return res.status(400).json({ error: 'Nome do presente e nome da pessoa são obrigatórios' });
        }

        // Buscar presente no Firebase
        const presente = await findPresenteByNome(nomePresente);
        
        if (!presente) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        // Verificar se já está confirmado
        if (presente.status === 'confirmado') {
            return res.status(400).json({ error: 'Este presente já foi confirmado por outra pessoa' });
        }

        // Atualizar presente
        await updatePresente(presente.id, {
            status: 'confirmado',
            pessoa: nomePessoa.trim(),
            dataConfirmacao: new Date().toISOString()
        });

        // Buscar presente atualizado
        const presenteAtualizado = await findPresenteByNome(nomePresente);

        return res.status(200).json({ 
            success: true, 
            message: 'Presente confirmado com sucesso!',
            presente: presenteAtualizado
        });
    } catch (error) {
        console.error('Erro ao confirmar presente:', error);
        const errorMessage = error.message || 'Erro ao confirmar presente';
        return res.status(500).json({ error: errorMessage });
    }
};
