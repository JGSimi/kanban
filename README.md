# TaskEasy - Gerenciador de Projetos

## 📋 Sobre o Projeto

TaskEasy é uma aplicação web moderna para gerenciamento de projetos e tarefas. O sistema oferece uma interface intuitiva e responsiva para organização de projetos através de quadros kanban.

## 🚀 Funcionalidades Principais

- **Login Simplificado**
  - Acesso rápido via e-mail
  - Verificação automática de usuário

- **Gestão de Projetos**
  - Criação e gerenciamento de quadros
  - Interface kanban intuitiva
  - Drag & drop de tarefas
  - Organização por colunas personalizáveis

- **Recursos Visuais**
  - Design moderno e minimalista
  - Animações suaves
  - Feedback visual em todas as interações
  - Temas personalizados por projeto

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Font Awesome (ícones)
- API REST (TaskBoard)

## 📦 Estrutura do Projeto

```
TaskEasy/
├── index.html          # Página principal (lista de projetos)
├── login.html          # Página de login
├── board.html          # Página do quadro kanban
├── js/
│   ├── request.js      # Configuração e requisições da API
│   ├── user.js         # Gerenciamento de usuário
│   ├── board.js        # Lógica dos quadros
│   ├── boardActions.js # Ações dos quadros
│   ├── login.js        # Lógica de autenticação
│   └── menu.js         # Componente do menu
└── style.css          # Estilos globais
```

## 🚀 Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em um servidor web local
3. Faça login com um e-mail cadastrado na API
4. Comece a gerenciar seus projetos!

## 📱 Responsividade

O projeto é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔒 Autenticação

O sistema utiliza autenticação simplificada via e-mail, com dados persistidos no localStorage para melhor experiência do usuário.

## 🌐 API

O projeto consome a API TaskBoard para todas as operações:
```javascript
const api = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/";
```

## ⚡ Performance

- Lazy loading de recursos
- Otimização de código
- Cache eficiente
- Animações otimizadas

## 🎯 Próximos Passos

- [ ] Implementar modo escuro
- [ ] Melhorar responsividade para outros dispositivos
- [ ] 
