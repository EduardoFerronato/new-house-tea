// Sistema de roteamento simples baseado em hash
function Router() {
    const getRota = () => {
        const hash = window.location.hash;
        if (hash.includes('controlepresentes')) {
            return 'controle';
        }
        return 'home';
    };

    const [rota, setRota] = React.useState(getRota());

    React.useEffect(() => {
        const handleHashChange = () => {
            setRota(getRota());
        };
        
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Verificar se é a rota de controle
    if (rota === 'controle') {
        if (typeof window.PaginaControle !== 'undefined') {
            return <window.PaginaControle />;
        } else {
            return (
                <div style={{
                    color: '#d4af37', 
                    padding: '20px', 
                    textAlign: 'center',
                    backgroundColor: '#0a1929',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div>Carregando página de controle...</div>
                </div>
            );
        }
    }

    // Rota padrão - página principal
    if (typeof window.App !== 'undefined') {
        return <window.App />;
    } else {
        return (
            <div style={{
                color: '#d4af37', 
                padding: '20px', 
                textAlign: 'center',
                backgroundColor: '#0a1929',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div>Carregando aplicação...</div>
            </div>
        );
    }
}

// Renderizar o Router
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Router />);

