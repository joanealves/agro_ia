<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estrutura do Banco de Dados - Sistema Agrícola</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            text-align: center;
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .subtitle {
            text-align: center;
            color: #718096;
            margin-bottom: 40px;
            font-size: 1.1em;
        }
        
        .modules {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .module {
            background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
            border-radius: 15px;
            padding: 25px;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .module:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #667eea;
        }
        
        .module-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .module-icon {
            font-size: 2em;
            margin-right: 15px;
        }
        
        .module-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #2d3748;
        }
        
        .module-tables {
            list-style: none;
        }
        
        .module-tables li {
            padding: 8px 12px;
            margin: 5px 0;
            background: white;
            border-radius: 8px;
            border-left: 3px solid #667eea;
            font-size: 0.95em;
            color: #4a5568;
            transition: all 0.2s ease;
        }
        
        .module-tables li:hover {
            background: #edf2f7;
            transform: translateX(5px);
        }
        
        .table-count {
            float: right;
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.85em;
        }
        
        .relationships {
            background: #f7fafc;
            border-radius: 15px;
            padding: 30px;
            margin-top: 40px;
        }
        
        .relationships h2 {
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .flow {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0;
        }
        
        .flow-item {
            background: white;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
            font-weight: 500;
            color: #2d3748;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .flow-arrow {
            font-size: 1.5em;
            color: #667eea;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .legend {
            background: #fff5f5;
            border-left: 4px solid #fc8181;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .legend h3 {
            color: #c53030;
            margin-bottom: 10px;
        }
        
        .legend-item {
            padding: 8px 0;
            color: #4a5568;
        }
        
        .legend-item strong {
            color: #2d3748;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌾 Sistema de Gestão Agrícola</h1>
        <p class="subtitle">Estrutura Completa do Banco de Dados PostgreSQL</p>
        
        <div class="modules">
            <!-- Módulo 1: Usuários -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">👤</div>
                    <div class="module-title">Usuários & Auth</div>
                </div>
                <ul class="module-tables">
                    <li>profiles <span class="table-count">Principal</span></li>
                    <li>configuracoes</li>
                    <li>alertas_config</li>
                    <li>notificacoes</li>
                    <li>logs_atividade</li>
                </ul>
            </div>
            
            <!-- Módulo 2: Propriedades -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">🏡</div>
                    <div class="module-title">Propriedades</div>
                </div>
                <ul class="module-tables">
                    <li>fazendas <span class="table-count">Principal</span></li>
                    <li>talhoes</li>
                    <li>mapas</li>
                </ul>
            </div>
            
            <!-- Módulo 3: Safras -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">🌾</div>
                    <div class="module-title">Safras</div>
                </div>
                <ul class="module-tables">
                    <li>safras <span class="table-count">Principal</span></li>
                    <li>safra_talhao</li>
                    <li>produtividade</li>
                </ul>
            </div>
            
            <!-- Módulo 4: Clima -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">🌤️</div>
                    <div class="module-title">Clima</div>
                </div>
                <ul class="module-tables">
                    <li>dados_climaticos <span class="table-count">Time-Series</span></li>
                </ul>
            </div>
            
            <!-- Módulo 5: Irrigação -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">💧</div>
                    <div class="module-title">Irrigação</div>
                </div>
                <ul class="module-tables">
                    <li>sistemas_irrigacao</li>
                    <li>irrigacoes</li>
                    <li>irrigacao_historico</li>
                </ul>
            </div>
            
            <!-- Módulo 6: Pragas -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">🐛</div>
                    <div class="module-title">Pragas & Doenças</div>
                </div>
                <ul class="module-tables">
                    <li>pragas <span class="table-count">Principal</span></li>
                    <li>pragas_registro</li>
                </ul>
            </div>
            
            <!-- Módulo 7: Aplicações -->
            <div class="module">
                <div class="module-header">
                    <div class="module-icon">🚜</div>
                    <div class="module-title">Aplicações</div>
                </div>
                <ul class="module-tables">
                    <li>aplicacoes <span class="table-count">Defensivos</span></li>
                </ul>
            </div>
        </div>
        
        <div class="relationships">
            <h2>🔗 Fluxo de Relacionamentos Principais</h2>
            
            <div class="flow">
                <div class="flow-item">👤 Usuário</div>
                <div class="flow-arrow">→</div>
                <div class="flow-item">🏡 Fazenda</div>
                <div class="flow-arrow">→</div>
                <div class="flow-item">📐 Talhão</div>
                <div class="flow-arrow">→</div>
                <div class="flow-item">🌾 Safra</div>
            </div>
            
            <div class="flow">
                <div class="flow-item">🌾 Safra</div>
                <div class="flow-arrow">↓</div>
            </div>
            
            <div class="flow">
                <div class="flow-item">🚜 Aplicações</div>
                <div class="flow-item">💧 Irrigações</div>
                <div class="flow-item">🐛 Pragas</div>
                <div class="flow-item">🌤️ Clima</div>
            </div>
            
            <div class="flow">
                <div class="flow-arrow">↓</div>
            </div>
            
            <div class="flow">
                <div class="flow-item">📊 Produtividade</div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">32</div>
                <div class="stat-label">Tabelas Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">10</div>
                <div class="stat-label">Módulos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">20+</div>
                <div class="stat-label">Relacionamentos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">5</div>
                <div class="stat-label">JSONB Fields</div>
            </div>
        </div>
        
        <div class="legend">
            <h3>📋 Principais Características</h3>
            <div class="legend-item">
                <strong>🔐 Multi-tenant:</strong> Isolamento por usuário/fazenda
            </div>
            <div class="legend-item">
                <strong>📍 Georreferenciado:</strong> Latitude/longitude em várias tabelas
            </div>
            <div class="legend-item">
                <strong>📊 Time-series:</strong> Dados climáticos e históricos
            </div>
            <div class="legend-item">
                <strong>🔔 Sistema de Alertas:</strong> Notificações configuráveis por usuário
            </div>
            <div class="legend-item">
                <strong>📝 Auditoria:</strong> Logs de atividade completos
            </div>
            <div class="legend-item">
                <strong>🗺️ GeoJSON:</strong> Suporte a polígonos e mapas
            </div>
        </div>
    </div>
    
    <script>
        // Adicionar interatividade aos módulos
        document.querySelectorAll('.module').forEach(module => {
            module.addEventListener('click', function() {
                this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                this.querySelectorAll('*').forEach(el => {
                    el.style.color = 'white';
                });
                
                setTimeout(() => {
                    this.style.background = 'linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%)';
                    this.querySelectorAll('.module-title, .module-tables li').forEach(el => {
                        el.style.color = '';
                    });
                }, 300);
            });
        });
    </script>
</body>
</html>
