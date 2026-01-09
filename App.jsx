function App() {
  const [nome, setNome] = React.useState('');
  const [presenteSelecionado, setPresenteSelecionado] = React.useState('');
  const [presentes, setPresentes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [enviando, setEnviando] = React.useState(false);
  const [mensagem, setMensagem] = React.useState(null);
  const [mostrarAgradecimento, setMostrarAgradecimento] = React.useState(false);
  const [dadosConfirmacao, setDadosConfirmacao] = React.useState(null);

  // URL base da API (detecta ambiente)
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : '';

  // Buscar presentes do backend
  React.useEffect(() => {
    buscarPresentes();
  }, []);

  const buscarPresentes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/presentes`);
      if (!response.ok) {
        throw new Error('Erro ao buscar presentes');
      }
      const data = await response.json();
      setPresentes(data);
    } catch (error) {
      console.error('Erro:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar presentes. Verifique se o servidor está rodando.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, digite seu nome!' });
      return;
    }

    if (!presenteSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione um presente!' });
      return;
    }

    try {
      setEnviando(true);
      setMensagem(null);

      const response = await fetch(`${API_BASE}/api/presentes/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomePresente: presenteSelecionado,
          nomePessoa: nome.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao confirmar presente');
      }

      // Salvar dados da confirmação
      setDadosConfirmacao({
        nome: nome.trim(),
        presente: presenteSelecionado
      });

      // Atualizar lista de presentes
      await buscarPresentes();

      // Redirecionar para página de agradecimento
      setMostrarAgradecimento(true);
    } catch (error) {
      console.error('Erro:', error);
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao confirmar presente. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  };

  // Filtrar apenas presentes disponíveis
  const presentesDisponiveis = presentes.filter(p => p.status === 'disponivel');

  // Componente de Página de Agradecimento
  function PaginaAgradecimento() {
    const containerStyle = {
      maxWidth: '700px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const cardStyle = {
      background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.98) 0%, rgba(26, 42, 58, 0.98) 100%)',
      borderRadius: '28px',
      padding: '60px 50px',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2) inset',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      textAlign: 'center',
      animation: 'fadeIn 0.8s ease-out',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    };

    const cardGlowStyle = {
      position: 'absolute',
      top: '-30%',
      left: '-30%',
      width: '160%',
      height: '160%',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
      animation: 'float 8s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 0
    };

    const iconStyle = {
      fontSize: '100px',
      marginBottom: '30px',
      animation: 'bounce 2s ease-in-out infinite',
      filter: 'drop-shadow(0 4px 20px rgba(212, 175, 55, 0.4))'
    };

    const titleStyle = {
      color: '#d4af37',
      fontSize: '44px',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif",
      marginBottom: '24px',
      textShadow: '0 2px 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
      letterSpacing: '-0.5px',
      lineHeight: '1.3'
    };

    const messageStyle = {
      color: 'rgba(244, 208, 63, 0.95)',
      fontSize: '20px',
      marginBottom: '35px',
      lineHeight: '1.8',
      fontWeight: '300',
      letterSpacing: '0.3px'
    };

    const detailStyle = {
      color: '#f4d03f',
      fontSize: '19px',
      marginTop: '35px',
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
      fontWeight: '500'
    };

    const buttonStyle = {
      marginTop: '35px',
      padding: '16px 35px',
      fontSize: '17px',
      fontWeight: '600',
      color: '#0a1929',
      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #ffd700 100%)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: '0.5px'
    };

    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={cardGlowStyle}></div>
          <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <div style={{ ...iconStyle, position: 'relative', zIndex: 10 }}>💝</div>
            <h1 style={{ ...titleStyle, position: 'relative', zIndex: 10 }}>
              Obrigado, {dadosConfirmacao?.nome}!
            </h1>
            <p style={{ ...messageStyle, position: 'relative', zIndex: 10 }}>
              Sua confirmação foi recebida com sucesso!
              <br />
              Estamos muito felizes em contar com você no nosso chá de casa nova.
            </p>
            {dadosConfirmacao && (
              <div style={{ ...detailStyle, position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}>Presente confirmado:</div>
                <strong style={{ fontSize: '22px' }}>{dadosConfirmacao.presente}</strong>
              </div>
            )}
            <p style={{
              color: 'rgba(244, 208, 63, 0.9)',
              marginTop: '40px',
              fontSize: '17px',
              fontWeight: '300',
              lineHeight: '1.8',
              position: 'relative',
              zIndex: 10
            }}>
              Com carinho,<br />
             
                Anna e Eduardo
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se mostrar agradecimento, renderizar página de agradecimento
  if (mostrarAgradecimento) {
    return <PaginaAgradecimento />;
  }

  const containerStyle = {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    minHeight: '100vh',
    color: '#d4af37',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(19, 47, 76, 1) 0%, rgba(26, 42, 58, 1) 100%)',
    borderRadius: '24px',
    padding: '0',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2) inset',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    width: '100%',
    animation: 'fadeIn 0.8s ease-out',
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate'
  };

  const cardGlowStyle = {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 60%)',
    animation: 'float 6s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.5
  };

  // URL da imagem do casal (adicione sua imagem aqui)
  // Coloque sua imagem na pasta do projeto com o nome 'casal.jpg' ou altere o nome abaixo
  const imagemCasal = 'casal.jpg'; // Altere para o caminho da sua imagem

  const [imagemErro, setImagemErro] = React.useState(false);

  const imageContainerStyle = {
    width: '100%',
    minHeight: '500px',
    overflow: 'visible',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 30px',
    background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.98) 0%, rgba(26, 42, 58, 0.98) 100%)',
    borderBottom: '3px solid rgba(212, 175, 55, 0.4)'
  };

  const imageWrapperStyle = {
    width: '420px',
    height: '420px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 1s ease-out'
  };

  const heartClipStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    filter: 'drop-shadow(0 20px 50px rgba(212, 175, 55, 0.6)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))',
    clipPath: 'path("M210,400 C210,400 30,285 30,175 C30,95 90,45 155,45 C180,45 200,60 210,80 C220,60 240,45 265,45 C330,45 390,95 390,175 C390,285 210,400 210,400 Z")',
    WebkitClipPath: 'path("M210,400 C210,400 30,285 30,175 C30,95 90,45 155,45 C180,45 200,60 210,80 C220,60 240,45 265,45 C330,45 390,95 390,175 C390,285 210,400 210,400 Z")'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    filter: 'brightness(0.98) contrast(1.08) saturate(1.15)',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
    opacity: 0,
    display: 'block',
    transform: 'scale(1.05)'
  };

  const imagePlaceholderStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)',
    color: 'rgba(212, 175, 55, 0.6)',
    flexDirection: 'column',
    gap: '20px',
    padding: '40px'
  };

  const imagePlaceholderTextStyle = {
    fontSize: '18px',
    color: 'rgba(212, 175, 55, 0.7)',
    fontFamily: "'Poppins', sans-serif",
    textAlign: 'center',
    lineHeight: '1.6'
  };

  const contentWrapperStyle = {
    padding: '40px 40px 50px 40px'
  };

  const titleStyle = {
    color: '#d4af37',
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '38px',
    fontWeight: '700',
    fontFamily: "'Playfair Display', serif",
    textShadow: '0 2px 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
    animation: 'fadeIn 1s ease-out',
    position: 'relative',
    zIndex: 20,
    display: 'block'
  };

  const subtitleStyle = {
    color: 'rgba(244, 208, 63, 0.9)',
    textAlign: 'center',
    marginBottom: '35px',
    marginTop: '20px',
    fontSize: '17px',
    fontWeight: '300',
    letterSpacing: '0.5px',
    animation: 'fadeIn 1.2s ease-out',
    lineHeight: '1.6'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '12px',
    color: '#d4af37',
    fontWeight: '500',
    fontSize: '15px',
    letterSpacing: '0.3px',
    animation: 'slideIn 0.6s ease-out'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 18px',
    fontSize: '16px',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '12px',
    marginBottom: '24px',
    boxSizing: 'border-box',
    background: 'rgba(26, 42, 58, 0.9)',
    color: '#f4d03f',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none'
  };

  const selectStyle = {
    width: '100%',
    padding: '16px 18px',
    fontSize: '16px',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '12px',
    marginBottom: '24px',
    boxSizing: 'border-box',
    background: 'rgba(26, 42, 58, 0.9)',
    color: '#f4d03f',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4af37' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 18px center',
    paddingRight: '45px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '18px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0a1929',
    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #ffd700 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    marginTop: '10px',
    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0.5)',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden'
  };

  const linkControleStyle = {
    position: 'fixed',
    top: '24px',
    right: '24px',
    padding: '12px 20px',
    color: '#d4af37',
    textDecoration: 'none',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(19, 47, 76, 0.7)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif"
  };

  return (
    <div style={containerStyle}>
      <a
        href="#/controlepresentes"
        style={linkControleStyle}
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
        <span>📋</span> Controle
      </a>
      <div style={cardStyle}>
        <div style={cardGlowStyle}></div>
        
        {/* Seção da Imagem do Casal */}
        <div style={imageContainerStyle}>
          {imagemCasal && !imagemErro ? (
            <div style={imageWrapperStyle}>
              {/* Container com clip-path de coração */}
              <div style={heartClipStyle}>
                <img 
                  src={imagemCasal} 
                  alt="Anna e Eduardo" 
                  style={imageStyle}
                  onError={() => {
                    console.error('Erro ao carregar imagem:', imagemCasal);
                    setImagemErro(true);
                  }}
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </div>
              
              {/* Borda decorativa dourada em formato de coração perfeito */}
              <svg 
                width="420" 
                height="420" 
                viewBox="0 0 420 420" 
                style={{
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  pointerEvents: 'none', 
                  zIndex: 2,
                  overflow: 'visible'
                }}
              >
                <defs>
                  <linearGradient id="heartBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="1" />
                    <stop offset="30%" stopColor="#f4d03f" stopOpacity="1" />
                    <stop offset="60%" stopColor="#ffd700" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f4d03f" stopOpacity="1" />
                  </linearGradient>
                  <filter id="heartGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="heartPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <circle cx="10" cy="10" r="1" fill="#d4af37" opacity="0.3"/>
                  </pattern>
                </defs>
                {/* Coração externo - borda principal com gradiente */}
                <path
                  d="M210,400 C210,400 30,285 30,175 C30,95 90,45 155,45 C180,45 200,60 210,80 C220,60 240,45 265,45 C330,45 390,95 390,175 C390,285 210,400 210,400 Z"
                  fill="none"
                  stroke="url(#heartBorderGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#heartGlow)"
                />
                {/* Coração médio - linha decorativa */}
                <path
                  d="M210,395 C210,395 40,290 40,180 C40,105 95,60 160,60 C183,60 203,72 210,85 C217,72 237,60 260,60 C325,60 380,105 380,180 C380,290 210,395 210,395 Z"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Coração interno - linha sutil */}
                <path
                  d="M210,390 C210,390 50,295 50,185 C50,115 100,75 165,75 C186,75 205,85 210,95 C215,85 234,75 255,75 C320,75 370,115 370,185 C370,295 210,390 210,390 Z"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              {/* Brilho decorativo ao redor */}
              <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: -1,
                animation: 'float 4s ease-in-out infinite',
                pointerEvents: 'none'
              }}></div>
            </div>
          ) : (
            <div style={{...imageWrapperStyle, width: '420px', height: '420px'}}>
              <div style={{...imagePlaceholderStyle, width: '420px', height: '420px', borderRadius: '0'}}>
                <div style={{fontSize: '90px', animation: 'bounce 2s ease-in-out infinite'}}>💑</div>
                <div style={imagePlaceholderTextStyle}>
                  <strong style={{color: '#d4af37', fontSize: '22px', display: 'block', marginBottom: '10px'}}>Anna e Eduardo</strong>
                  <div>Adicione sua foto do casal</div>
                  <div style={{fontSize: '14px', marginTop: '10px', opacity: 0.7}}>
                    Coloque a imagem como <strong>casal.jpg</strong> na pasta do projeto
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo do Convite */}
        <div style={contentWrapperStyle}>
          <div style={{ position: 'relative', zIndex: 20, width: '100%' }}>
            <div style={{marginBottom: '35px'}}>
              <h1 style={titleStyle}>
                Chá de Casa Nova
              </h1>
              <div style={{
                textAlign: 'center',
                marginTop: '15px',
                fontSize: '28px',
                color: '#f4d03f',
                fontWeight: '600',
                textShadow: '0 2px 8px rgba(212, 175, 55, 0.6)',
                fontFamily: "'Playfair Display', serif"
              }}>
                Anna e Eduardo
              </div>
            </div>
            <p style={subtitleStyle}>Confirme seu presente e ele será reservado para você</p>

          <div>
            <label style={labelStyle}>
              Seu Nome:
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              style={inputStyle}
              disabled={loading || enviando}
              onFocus={(e) => {
                 if (!loading && !enviando) {
                   e.target.style.borderColor = '#f4d03f';
                   e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1), 0 0 20px rgba(212, 175, 55, 0.3)';
                   e.target.style.transform = 'translateY(-2px)';
                   e.target.style.background = 'rgba(26, 42, 58, 1)';
                 }
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                 e.target.style.boxShadow = 'none';
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.background = 'rgba(26, 42, 58, 0.9)';
               }}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Selecione o Presente:
            </label>
            <select
              value={presenteSelecionado}
              onChange={(e) => setPresenteSelecionado(e.target.value)}
              style={selectStyle}
               onFocus={(e) => {
                 e.target.style.borderColor = '#f4d03f';
                 e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1), 0 0 20px rgba(212, 175, 55, 0.3)';
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.background = 'rgba(26, 42, 58, 1)';
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                 e.target.style.boxShadow = 'none';
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.background = 'rgba(26, 42, 58, 0.9)';
               }}
              disabled={loading || enviando}
            >
              <option value="">-- Escolha um presente --</option>
              {loading ? (
                <option value="" disabled>Carregando presentes...</option>
              ) : presentesDisponiveis.length === 0 ? (
                <option value="" disabled>Todos os presentes foram reservados</option>
              ) : (
                presentesDisponiveis.map((presente, index) => (
                  <option key={index} value={presente.nome}>
                    {presente.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          {mensagem && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: mensagem.tipo === 'sucesso'
                ? 'rgba(76, 175, 80, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
              border: `2px solid ${mensagem.tipo === 'sucesso' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`,
              color: mensagem.tipo === 'sucesso' ? '#81c784' : '#ef5350',
              textAlign: 'center',
              fontWeight: '500',
              fontSize: '15px',
              animation: 'fadeIn 0.5s ease-out',
              boxShadow: `0 4px 16px ${mensagem.tipo === 'sucesso' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`
            }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>
                {mensagem.tipo === 'sucesso' ? '✓' : '✗'}
              </span>
              {mensagem.texto}
            </div>
          )}

          <div>
            <button
              onClick={handleConfirmar}
              disabled={loading || enviando || presentesDisponiveis.length === 0}
              style={{
                ...buttonStyle,
                opacity: (loading || enviando || presentesDisponiveis.length === 0) ? 0.6 : 1,
                cursor: (loading || enviando || presentesDisponiveis.length === 0) ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!loading && !enviando && presentesDisponiveis.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(212, 175, 55, 0.6), 0 0 0 0 rgba(212, 175, 55, 0.7)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f4d03f 0%, #ffd700 50%, #ffed4e 100%)';
                  e.currentTarget.style.animation = 'pulse 2s ease-in-out infinite';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && !enviando && presentesDisponiveis.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #ffd700 100%)';
                  e.currentTarget.style.animation = 'none';
                }
              }}
            >
              {enviando ? '⏳ Confirmando...' : '✓ Confirmar Presente'}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tornar App disponível globalmente
window.App = App;
