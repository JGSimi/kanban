import user from "./user.js";
import requests from "./request.js";

async function loadRecentProjects() {
    try {
        console.log('Carregando projetos recentes para o usuário:', user.Id);
        const boards = await requests.GetBoards();
        console.log('Boards recebidas:', boards);

        // Filtra as boards do usuário atual
        const userBoards = boards.filter(board => {
            const boardUserId = board.CreatedBy;
            const userId = parseInt(user.Id);
            return boardUserId === userId;
        });

        console.log('Boards do usuário:', userBoards);
        const recentProjectsContainer = document.querySelector('.space-y-1');
        
        if (!recentProjectsContainer) return;

        if (!userBoards || userBoards.length === 0) {
            recentProjectsContainer.innerHTML = `
                <div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Nenhum projeto encontrado
                </div>
            `;
            return;
        }

        // Pega os 5 projetos mais recentes
        const recentBoards = userBoards
            .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
            .slice(0, 5);

        recentProjectsContainer.innerHTML = recentBoards.map(board => `
            <a href="board.html?id=${board.Id}" 
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 group">
                <div class="w-2 h-2 rounded-full" style="background-color: ${board.HexaBackgroundCoor || '#4F46E5'}"></div>
                <span class="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">${board.Name}</span>
            </a>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar projetos recentes:', error);
        const recentProjectsContainer = document.querySelector('.space-y-1');
        if (recentProjectsContainer) {
            recentProjectsContainer.innerHTML = `
                <div class="px-3 py-2 text-sm text-red-500 dark:text-red-400">
                    Erro ao carregar projetos
                </div>
            `;
        }
    }
}

function createMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fixed inset-y-0 left-0 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.15)] transform -translate-x-full transition-all duration-500 ease-out z-[100] flex flex-col';
    menuContainer.id = 'menu-container';

    menuContainer.innerHTML = `
        <!-- Header -->
        <div class="p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden shrink-0">
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODAgMGM4OC4zNjcgMCAxNjAgNzEuNjMzIDE2MCAxNjBzLTcxLjYzMyAxNjAtMTYwIDE2MFMtODAgMjQ4LjM2Ny04MCAxNjAgNzEuNjMzIDAgODAgMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-50"></div>
            <div class="relative">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <i class="fas fa-tasks text-xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold tracking-tight">TaskEasy</h2>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="theme-toggle" 
                            class="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group">
                            <i class="fas fa-moon text-gray-600 dark:text-gray-400 text-lg transform transition-all duration-500 group-hover:rotate-12"></i>
                        </button>
                        <button id="close-menu" class="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:rotate-90">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 group">
                    <div class="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <i class="fas fa-user text-2xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-lg truncate">${user.Name || 'Usuário'}</h3>
                        <p class="text-sm text-white/80 truncate">${user.Email || ''}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Menu Content -->
        <div class="flex-1 overflow-y-auto">
            <nav class="p-6 space-y-3">
                <a href="index.html" class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group">
                    <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-home text-lg"></i>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">Início</span>
                </a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group">
                    <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-star text-lg"></i>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400">Favoritos</span>
                </a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group">
                    <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-archive text-lg"></i>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">Arquivados</span>
                </a>
                
                <!-- Logout Button -->
                <button id="logout-button"
                    class="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group">
                    <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-sign-out-alt text-lg transform group-hover:-translate-x-1 transition-transform duration-300"></i>
                    </div>
                    <span class="text-red-600 dark:text-red-400 font-medium">Sair da Conta</span>
                </button>
            </nav>

            <div class="px-6 pt-6 pb-8">
                <h3 class="px-4 mb-4 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Projetos Recentes</h3>
                <div class="space-y-2 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-2">
                    <div class="space-y-1">
                        <div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            Carregando projetos...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(menuContainer);

    // Adiciona overlay para fechar o menu
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-500 z-[99]';
    overlay.id = 'menu-overlay';
    document.body.appendChild(overlay);

    // Event Listeners
    const closeButton = menuContainer.querySelector('#close-menu');
    const logoutButton = menuContainer.querySelector('#logout-button');
    const themeToggle = menuContainer.querySelector('#theme-toggle');
    
    closeButton.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    themeToggle.addEventListener('click', () => window.themeService.toggle());
    logoutButton.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja sair?')) {
            user.clear();
            window.location.href = 'login.html';
        }
    });

    // Adiciona botão de toggle do menu no header se não existir
    if (!document.querySelector('#toggle-menu')) {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-menu';
        toggleButton.className = 'w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:scale-[1.05] transition-all duration-300 group';
        toggleButton.innerHTML = '<i class="fas fa-bars text-white text-lg group-hover:rotate-180 transition-transform duration-500"></i>';
        toggleButton.addEventListener('click', toggleMenu);

        const header = document.querySelector('header');
        if (header) {
            header.firstElementChild.insertBefore(toggleButton, header.firstElementChild.firstChild);
        }
    }

    // Carrega os projetos recentes
    loadRecentProjects();
}

function toggleMenu() {
    const menuContainer = document.getElementById('menu-container');
    const overlay = document.getElementById('menu-overlay');
    
    if (menuContainer.classList.contains('-translate-x-full')) {
        menuContainer.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    } else {
        menuContainer.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        user.clear();
    }
}

// Adiciona o menu quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', createMenu);

export default {
    toggleMenu,
    logout
};