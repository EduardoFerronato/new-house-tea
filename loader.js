// Aguardar o carregamento completo da página e das bibliotecas
window.addEventListener('DOMContentLoaded', async function() {
    // Aguardar React, ReactDOM e Babel estarem disponíveis
    function waitForLibs() {
        return new Promise((resolve) => {
            const checkLibs = setInterval(() => {
                if (typeof React !== 'undefined' && 
                    typeof ReactDOM !== 'undefined' && 
                    typeof Babel !== 'undefined') {
                    clearInterval(checkLibs);
                    resolve();
                }
            }, 50);
        });
    }
    
    await waitForLibs();
    
    // Aguardar um pouco mais para garantir que está tudo pronto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Função para carregar e executar arquivos JSX
    async function loadJSX(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const code = await response.text();
            const transpiled = Babel.transform(code, { presets: ['react'] }).code;
            
            // Criar um script tag dinâmico e executar no escopo global
            const script = document.createElement('script');
            script.textContent = transpiled;
            document.head.appendChild(script);
            document.head.removeChild(script);
        } catch (error) {
            console.error('Erro ao carregar', url, error);
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = '<div style="color: #d4af37; padding: 20px; text-align: center; background-color: #0a1929; min-height: 100vh; display: flex; align-items: center; justify-content: center;"><div><h1>Erro ao carregar a aplicação</h1><p>' + error.message + '</p></div></div>';
            }
        }
    }

    // Carregar arquivos na ordem correta
    await loadJSX('App.jsx');
    await loadJSX('PaginaControle.jsx');
    
    // Aguardar App estar disponível
    let attempts = 0;
    while (typeof window.App === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
    }
    
    if (typeof window.App === 'undefined') {
        throw new Error('App não foi definido após carregar App.jsx');
    }
    
    await loadJSX('main.js');
});

