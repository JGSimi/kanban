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
                <div class="px-3 py-2 text-sm text-gray-500">
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
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 group">
                <div class="w-2 h-2 rounded-full" style="background-color: ${board.HexaBackgroundCoor || '#4F46E5'}"></div>
                <span class="text-gray-700 group-hover:text-blue-600 truncate">${board.Name}</span>
            </a>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar projetos recentes:', error);
        const recentProjectsContainer = document.querySelector('.space-y-1');
        if (recentProjectsContainer) {
            recentProjectsContainer.innerHTML = `
                <div class="px-3 py-2 text-sm text-red-500">
                    Erro ao carregar projetos
                </div>
            `;
        }
    }
}

function createMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fixed inset-y-0 left-0 w-72 bg-white shadow-xl transform -translate-x-full transition-transform duration-300 ease-in-out z-50';
    menuContainer.id = 'menu-container';

    const menu = document.createElement('div');
    menu.className = 'h-full flex flex-col';
    menu.innerHTML = `
        <!-- Header do Menu -->
        <div class="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">TaskEasy</h2>
                <button id="close-menu" class="p-2 hover:bg-white/10 rounded-full transition-colors duration-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-2xl"></i>
                </div>
                <div>
                    <h3 class="font-medium">${user.Name || 'Usuário'}</h3>
                    <p class="text-sm text-white/80">${user.Email || ''}</p>
                </div>
            </div>
        </div>

        <!-- Links do Menu -->
        <nav class="flex-1 p-4 overflow-y-auto">
            <div class="space-y-2">
                <a href="index.html" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 group">
                    <i class="fas fa-home text-gray-500 group-hover:text-blue-600"></i>
                    <span class="text-gray-700 group-hover:text-blue-600">Início</span>
                </a>
                <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 group">
                    <i class="fas fa-star text-gray-500 group-hover:text-blue-600"></i>
                    <span class="text-gray-700 group-hover:text-blue-600">Favoritos</span>
                </a>
                <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 group">
                    <i class="fas fa-archive text-gray-500 group-hover:text-blue-600"></i>
                    <span class="text-gray-700 group-hover:text-blue-600">Arquivados</span>
                </a>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Projetos Recentes</h3>
                <div class="space-y-1">
                    <!-- Projetos recentes serão adicionados aqui dinamicamente -->
                    <div class="px-3 py-2 text-sm text-gray-500">
                        Carregando projetos...
                    </div>
                </div>
            </div>
        </nav>

        <!-- Footer do Menu -->
        <div class="p-4 border-t border-gray-200">
            <button id="logout-button" 
                class="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </button>
        </div>
    `;

    menuContainer.appendChild(menu);
    document.body.appendChild(menuContainer);

    // Adiciona overlay para fechar o menu
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 opacity-0 pointer-events-none transition-opacity duration-300 z-40';
    overlay.id = 'menu-overlay';
    document.body.appendChild(overlay);

    // Event Listeners
    const closeButton = menu.querySelector('#close-menu');
    const logoutButton = menu.querySelector('#logout-button');

    closeButton.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    logoutButton.addEventListener('click', logout);

    // Adiciona botão de toggle do menu no header se não existir
    if (!document.querySelector('#toggle-menu')) {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-menu';
        toggleButton.className = 'p-2 hover:bg-gray-100 rounded-full transition-colors duration-300';
        toggleButton.innerHTML = '<i class="fas fa-bars text-gray-600"></i>';
        toggleButton.addEventListener('click', toggleMenu);

        // Adiciona o botão no início do header
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
        // Abre o menu
        menuContainer.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    } else {
        // Fecha o menu
        menuContainer.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        user.clear();
        window.location.href = 'login.html';
    }
}

// Adiciona o menu quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', createMenu);

export default {
    toggleMenu,
    logout
};