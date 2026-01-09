function PaginaControle() {
    const [presentes, setPresentes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [mostrarFormAdd, setMostrarFormAdd] = React.useState(false);
    const [novoPresenteNome, setNovoPresenteNome] = React.useState('');
    const [adicionando, setAdicionando] = React.useState(false);
    const [mensagem, setMensagem] = React.useState(null);
    const [removendoId, setRemovendoId] = React.useState(null);
    const [resetandoId, setResetandoId] = React.useState(null);

    // URL base da API (detecta ambiente)
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : '';

    React.useEffect(() => {
        buscarPresentes();
    }, []);

    const buscarPresentes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/presentes`);
            
            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Servidor retornou uma resposta inválida. Verifique se o servidor está rodando na porta 3001 (npm run server).');
            }
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao buscar presentes');
            }
            const data = await response.json();
            setPresentes(data);
            setMensagem(null); // Limpar mensagens de erro anteriores
        } catch (error) {
            console.error('Erro:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setMensagem({ tipo: 'erro', texto: 'Erro de conexão. Verifique se o servidor está rodando na porta 3001. Execute: npm run server' });
            } else {
                setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar presentes. Verifique se o servidor está rodando.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const adicionarPresente = async () => {
        if (!novoPresenteNome.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Por favor, digite o nome do presente' });
            return;
        }

        try {
            setAdicionando(true);
            setMensagem(null);
            const response = await fetch(`${API_BASE}/api/presentes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome: novoPresenteNome.trim() })
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Servidor retornou uma resposta inválida. Verifique se o servidor está rodando na porta 3001.');
            }

            const data = await response.json();

            if (!response.ok) {
                // Se o erro contém informação sobre read-only, mostrar mensagem mais clara
                const errorMsg = data.error || 'Erro ao adicionar presente';
                throw new Error(errorMsg);
            }

            setMensagem({ tipo: 'sucesso', texto: 'Presente adicionado com sucesso!' });
            setNovoPresenteNome('');
            setMostrarFormAdd(false);
            await buscarPresentes();
        } catch (error) {
            console.error('Erro:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setMensagem({ tipo: 'erro', texto: 'Erro de conexão. Verifique se o servidor está rodando (npm run server)' });
            } else {
                setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao adicionar presente' });
            }
        } finally {
            setAdicionando(false);
        }
    };

    const removerPresente = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este presente?')) {
            return;
        }

        try {
            setRemovendoId(id);
            setMensagem(null);
            const response = await fetch(`${API_BASE}/api/presentes/${id}`, {
                method: 'DELETE'
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Servidor retornou uma resposta inválida. Verifique se o servidor está rodando.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao remover presente');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Presente removido com sucesso!' });
            await buscarPresentes();
        } catch (error) {
            console.error('Erro:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setMensagem({ tipo: 'erro', texto: 'Erro de conexão. Verifique se o servidor está rodando (npm run server)' });
            } else {
                setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao remover presente' });
            }
        } finally {
            setRemovendoId(null);
        }
    };

    const resetarPresente = async (id) => {
        if (!window.confirm('Tem certeza que deseja resetar este presente? Ele voltará a ficar disponível.')) {
            return;
        }

        try {
            setResetandoId(id);
            setMensagem(null);
            const response = await fetch(`${API_BASE}/api/presentes/${id}/resetar`, {
                method: 'POST'
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Servidor retornou uma resposta inválida. Verifique se o servidor está rodando.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao resetar presente');
            }

            setMensagem({ tipo: 'sucesso', texto: 'Presente resetado com sucesso!' });
            await buscarPresentes();
        } catch (error) {
            console.error('Erro:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setMensagem({ tipo: 'erro', texto: 'Erro de conexão. Verifique se o servidor está rodando (npm run server)' });
            } else {
                setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao resetar presente' });
            }
        } finally {
            setResetandoId(null);
        }
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const presentesDisponiveis = presentes.filter(p => p.status === 'disponivel');
    const presentesConfirmados = presentes.filter(p => p.status === 'confirmado')
        .sort((a, b) => {
            if (a.dataConfirmacao && b.dataConfirmacao) {
                return new Date(b.dataConfirmacao) - new Date(a.dataConfirmacao);
            }
            return 0;
        });

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '50px 30px',
        fontFamily: "'Poppins', sans-serif",
        minHeight: '100vh',
        color: '#d4af37',
        position: 'relative'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '50px',
        animation: 'fadeIn 0.8s ease-out'
    };

    const titleStyle = {
        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #ffd700 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '48px',
        fontWeight: '700',
        fontFamily: "'Playfair Display', serif",
        marginBottom: '15px',
        textShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
        letterSpacing: '-0.5px'
    };

    const subtitleStyle = {
        color: 'rgba(244, 208, 63, 0.9)',
        fontSize: '20px',
        fontWeight: '300',
        letterSpacing: '0.5px'
    };

    const linkStyle = {
        display: 'inline-block',
        marginBottom: '30px',
        padding: '12px 24px',
        color: '#d4af37',
        textDecoration: 'none',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '16px',
        fontWeight: '500',
        background: 'rgba(19, 47, 76, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    };

    const sectionStyle = {
        marginBottom: '40px'
    };

    const sectionTitleStyle = {
        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '28px',
        fontWeight: '600',
        fontFamily: "'Playfair Display', serif",
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        letterSpacing: '-0.3px'
    };

    const cardStyle = {
        background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.8) 0%, rgba(26, 42, 58, 0.8) 100%)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    const cardConfirmadoStyle = {
        ...cardStyle,
        border: '1px solid rgba(76, 175, 80, 0.5)',
        background: 'linear-gradient(145deg, rgba(26, 58, 74, 0.85) 0%, rgba(19, 47, 76, 0.85) 100%)',
        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)'
    };

    const cardDisponivelStyle = {
        ...cardStyle,
        border: '1px solid rgba(244, 208, 63, 0.4)',
        background: 'linear-gradient(145deg, rgba(26, 58, 74, 0.85) 0%, rgba(19, 47, 76, 0.85) 100%)',
        boxShadow: '0 8px 24px rgba(244, 208, 63, 0.15)'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
        marginTop: '25px'
    };

    const itemNomeStyle = {
        color: '#f4d03f',
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '12px',
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: '0.2px'
    };

    const itemPessoaStyle = {
        color: '#d4af37',
        fontSize: '17px',
        marginBottom: '8px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const itemDataStyle = {
        color: 'rgba(244, 208, 63, 0.7)',
        fontSize: '14px',
        fontStyle: 'italic',
        fontWeight: '300',
        marginTop: '8px'
    };

    const statusBadgeStyle = {
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '15px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    };

    const disponivelBadgeStyle = {
        ...statusBadgeStyle,
        background: 'linear-gradient(135deg, #f4d03f 0%, #ffd700 100%)',
        color: '#0a1929'
    };

    const confirmadoBadgeStyle = {
        ...statusBadgeStyle,
        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
        color: '#0a1929'
    };

    const statsStyle = {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '50px',
        flexWrap: 'wrap',
        gap: '30px',
        animation: 'fadeIn 1s ease-out'
    };

    const statCardStyle = {
        background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.9) 0%, rgba(26, 42, 58, 0.9) 100%)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '30px 40px',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        textAlign: 'center',
        minWidth: '220px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default'
    };

    const statNumberStyle = {
        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '56px',
        fontWeight: '800',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        marginBottom: '8px',
        lineHeight: '1',
        letterSpacing: '-1px',
        textShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
    };

    const statLabelStyle = {
        color: 'rgba(244, 208, 63, 0.9)',
        fontSize: '13px',
        fontWeight: '400',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', color: '#d4af37', fontSize: '20px' }}>
                    Carregando...
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>📋 Controle de Presentes</h1>
                <p style={subtitleStyle}>Chá de Casa Nova - Anna e Eduardo</p>
                <a 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = '';
                    }}
                    style={linkStyle} 
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.95)';
                        e.currentTarget.style.color = '#0a1929';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
                        e.currentTarget.style.borderColor = '#d4af37';
                    }} 
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(19, 47, 76, 0.7)';
                        e.currentTarget.style.color = '#d4af37';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    }}
                >
                    ← Voltar para página principal
                </a>
            </div>

            <div style={statsStyle}>
                <div style={statCardStyle}>
                    <div style={statNumberStyle}>{presentes.length}</div>
                    <div style={statLabelStyle}>Total de Presentes</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{
                        ...statNumberStyle,
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>{presentesConfirmados.length}</div>
                    <div style={statLabelStyle}>Confirmados</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{
                        ...statNumberStyle,
                        background: 'linear-gradient(135deg, #f4d03f 0%, #ffd700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>{presentesDisponiveis.length}</div>
                    <div style={statLabelStyle}>Disponíveis</div>
                </div>
            </div>

            {/* Mensagens */}
            {mensagem && (
                <div style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    background: mensagem.tipo === 'sucesso'
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(244, 67, 54, 0.2)',
                    border: `2px solid ${mensagem.tipo === 'sucesso' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`,
                    color: mensagem.tipo === 'sucesso' ? '#81c784' : '#ef5350',
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: '15px',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <span style={{ fontSize: '18px', marginRight: '8px' }}>
                        {mensagem.tipo === 'sucesso' ? '✓' : '✗'}
                    </span>
                    {mensagem.texto}
                    <button
                        onClick={() => setMensagem(null)}
                        style={{
                            marginLeft: '15px',
                            background: 'transparent',
                            border: 'none',
                            color: mensagem.tipo === 'sucesso' ? '#81c784' : '#ef5350',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Botão para adicionar presente */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <button
                    onClick={() => setMostrarFormAdd(!mostrarFormAdd)}
                    style={{
                        padding: '14px 28px',
                        background: mostrarFormAdd 
                            ? 'linear-gradient(135deg, #f44336 0%, #e53935 100%)'
                            : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #ffd700 100%)',
                        color: '#0a1929',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.3px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.5)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                    }}
                >
                    {mostrarFormAdd ? '✕ Cancelar' : '➕ Adicionar Novo Presente'}
                </button>

                {/* Formulário para adicionar presente */}
                {mostrarFormAdd && (
                    <div style={{
                        marginTop: '20px',
                        padding: '30px',
                        background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.95) 0%, rgba(26, 42, 58, 0.95) 100%)',
                        borderRadius: '16px',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                        animation: 'fadeIn 0.4s ease-out'
                    }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            color: '#d4af37',
                            fontWeight: '500',
                            fontSize: '16px'
                        }}>
                            Nome do Presente:
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                value={novoPresenteNome}
                                onChange={(e) => setNovoPresenteNome(e.target.value)}
                                placeholder="Ex: Jogo de Talheres"
                                style={{
                                    flex: 1,
                                    padding: '14px 18px',
                                    fontSize: '16px',
                                    border: '2px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '10px',
                                    background: 'rgba(26, 42, 58, 0.8)',
                                    color: '#f4d03f',
                                    fontFamily: "'Poppins', sans-serif",
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#f4d03f';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                                    e.target.style.boxShadow = 'none';
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !adicionando) {
                                        adicionarPresente();
                                    }
                                }}
                            />
                            <button
                                onClick={adicionarPresente}
                                disabled={adicionando || !novoPresenteNome.trim()}
                                style={{
                                    padding: '14px 28px',
                                    background: adicionando || !novoPresenteNome.trim()
                                        ? 'rgba(212, 175, 55, 0.3)'
                                        : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                    color: adicionando || !novoPresenteNome.trim() ? '#888' : '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: adicionando || !novoPresenteNome.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {adicionando ? '⏳ Adicionando...' : '✓ Adicionar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>
                    ✓ Presentes Confirmados ({presentesConfirmados.length})
                </h2>
                {presentesConfirmados.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: 'rgba(244, 208, 63, 0.6)',
                        fontSize: '18px',
                        fontStyle: 'italic'
                    }}>
                        Nenhum presente confirmado ainda.
                    </div>
                ) : (
                    <div style={gridStyle}>
                        {presentesConfirmados.map((presente) => (
                            <div 
                                key={presente.id} 
                                style={cardConfirmadoStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(76, 175, 80, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.2)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div style={confirmadoBadgeStyle}>✓ CONFIRMADO</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => resetarPresente(presente.id)}
                                            disabled={resetandoId === presente.id}
                                            style={{
                                                padding: '6px 12px',
                                                background: resetandoId === presente.id
                                                    ? 'rgba(244, 208, 63, 0.3)'
                                                    : 'linear-gradient(135deg, #f4d03f 0%, #ffd700 100%)',
                                                color: '#0a1929',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                cursor: resetandoId === presente.id ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                opacity: resetandoId === presente.id ? 0.6 : 1
                                            }}
                                            title="Resetar presente"
                                        >
                                            {resetandoId === presente.id ? '⏳' : '↻'}
                                        </button>
                                        <button
                                            onClick={() => removerPresente(presente.id)}
                                            disabled={removendoId === presente.id}
                                            style={{
                                                padding: '6px 12px',
                                                background: removendoId === presente.id
                                                    ? 'rgba(244, 67, 54, 0.3)'
                                                    : 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                cursor: removendoId === presente.id ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                opacity: removendoId === presente.id ? 0.6 : 1
                                            }}
                                            title="Remover presente"
                                        >
                                            {removendoId === presente.id ? '⏳' : '✕'}
                                        </button>
                                    </div>
                                </div>
                                <div style={itemNomeStyle}>{presente.nome}</div>
                                <div style={itemPessoaStyle}>
                                    <span>👤</span> {presente.pessoa || 'N/A'}
                                </div>
                                <div style={itemDataStyle}>
                                    <span>📅</span> {formatarData(presente.dataConfirmacao)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>
                    ⏳ Presentes Disponíveis ({presentesDisponiveis.length})
                </h2>
                {presentesDisponiveis.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'rgba(244, 208, 63, 0.9)',
                        fontSize: '20px',
                        fontWeight: '500'
                    }}>
                        🎉 Todos os presentes foram confirmados! 🎉
                    </div>
                ) : (
                    <div style={gridStyle}>
                        {presentesDisponiveis.map((presente) => (
                            <div 
                                key={presente.id} 
                                style={cardDisponivelStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(244, 208, 63, 0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 208, 63, 0.15)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div style={disponivelBadgeStyle}>⏳ DISPONÍVEL</div>
                                    <button
                                        onClick={() => removerPresente(presente.id)}
                                        disabled={removendoId === presente.id}
                                        style={{
                                            padding: '6px 12px',
                                            background: removendoId === presente.id
                                                ? 'rgba(244, 67, 54, 0.3)'
                                                : 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            cursor: removendoId === presente.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            opacity: removendoId === presente.id ? 0.6 : 1
                                        }}
                                        title="Remover presente"
                                    >
                                        {removendoId === presente.id ? '⏳' : '✕'}
                                    </button>
                                </div>
                                <div style={itemNomeStyle}>{presente.nome}</div>
                                <div style={{...itemPessoaStyle, color: 'rgba(244, 208, 63, 0.6)', fontSize: '15px'}}>
                                    Aguardando confirmação
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Tornar PaginaControle disponível globalmente
window.PaginaControle = PaginaControle;

