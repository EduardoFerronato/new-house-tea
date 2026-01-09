const { findPresenteById, deletePresente, initFirebase } = require('../firebase-helper');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Inicializar Firebase
    initFirebase();

    try {
        // Na Vercel, o ID vem de req.query.id quando usando [id].js
        const id = req.query.id || req.url.split('/').pop();
        const idNum = parseInt(id);

        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o presente existe
        const presente = await findPresenteById(idNum);
        
        if (!presente) {
            return res.status(404).json({ error: 'Presente não encontrado' });
        }

        // Deletar presente
        await deletePresente(idNum);

        return res.status(200).json({ 
            success: true, 
            message: 'Presente removido com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao remover presente:', error);
        const errorMessage = error.message || 'Erro ao remover presente';
        return res.status(500).json({ error: errorMessage });
    }
};
