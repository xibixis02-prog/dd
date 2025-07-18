# 🍄 Super Mario Game

Um jogo do Super Mario clássico desenvolvido em HTML5, CSS3 e JavaScript puro!

## 🎮 Como Jogar

### Controles do Teclado:
- **← →** ou **A D**: Mover Mario para esquerda/direita
- **↑** ou **W**: Pular
- **Espaço**: Correr (manter pressionado)

### Controles Mobile:
- Use os botões na tela para controlar Mario no dispositivo móvel

### Objetivos:
- 🪙 Colete moedas para ganhar pontos (50 pontos cada)
- 👾 Pule nos inimigos para eliminá-los (100 pontos cada)
- 💊 Colete power-ups para ficar invencível temporariamente (200 pontos)
- ❤️ Você tem 3 vidas - tome cuidado!

## 🎯 Características do Jogo

### Física Realista:
- Gravidade e impulso de pulo autênticos
- Sistema de fricção para movimento suave
- Detecção de colisão precisa

### Elementos do Jogo:
- **Mario**: Personagem principal com animação de chapéu e bigode
- **Plataformas**: Blocos de tijolos e chão para pular
- **Inimigos (Goombas)**: Inimigos marrons que se movem automaticamente
- **Moedas**: Coletáveis dourados que flutuam
- **Power-ups**: Itens especiais que concedem invencibilidade
- **Sistema de Partículas**: Efeitos visuais ao pular e coletar itens

### Interface Visual:
- **Fundo Dinâmico**: Gradiente de céu para grama com nuvens em movimento
- **HUD**: Pontuação, vidas e moedas em tempo real
- **Câmera**: Segue Mario suavemente pelo nível
- **Design Responsivo**: Funciona em desktop e mobile

### Mecânicas Avançadas:
- **Sistema de Vidas**: 3 vidas com invencibilidade temporária após dano
- **Rolagem de Câmera**: O mundo se move conforme Mario avança
- **Efeitos Visuais**: Partículas ao pular, coletar itens e derrotar inimigos
- **Controles Mobile**: Botões touch-friendly para dispositivos móveis

## 🚀 Como Executar

1. **Opção 1 - Servidor Local:**
   ```bash
   python3 -m http.server 8000
   ```
   Depois acesse: http://localhost:8000

2. **Opção 2 - Abrir Diretamente:**
   - Abra o arquivo `index.html` no seu navegador

3. **Opção 3 - Live Server (VS Code):**
   - Use a extensão Live Server no VS Code

## 🎨 Tecnologias Utilizadas

- **HTML5 Canvas**: Para renderização gráfica
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript ES6+**: Lógica do jogo com classes e módulos
- **Responsive Design**: Compatível com mobile e desktop

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móveis (Android/iOS)
- ✅ Tablets
- ✅ Desktop (Windows, Mac, Linux)

## 🎪 Características Técnicas

### Arquitetura do Código:
- **Programação Orientada a Objetos**: Classes para Player, Enemy, Platform, etc.
- **Game Loop**: Loop principal com requestAnimationFrame para 60 FPS
- **Gerenciamento de Estado**: Sistema de jogo pausado/rodando
- **Sistema de Eventos**: Listeners para teclado e touch

### Performance:
- **Canvas API**: Renderização eficiente
- **Otimização de Partículas**: Limpeza automática de partículas antigas
- **Collision Detection**: Algoritmo otimizado para detecção de colisões

## 🎯 Futuras Melhorias

- [ ] Mais tipos de inimigos
- [ ] Sistema de níveis múltiplos
- [ ] Trilha sonora e efeitos sonoros
- [ ] Power-ups adicionais (Super Mario, Fire Mario)
- [ ] Animações de sprite mais detalhadas
- [ ] Sistema de high score
- [ ] Modo multiplayer local

## 🤝 Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades!

---

🎮 **Divirta-se jogando Super Mario!** 🍄