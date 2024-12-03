import requests from "./request.js";
import user from "./user.js";
import boardActions from "./boardActions.js";


async function verifyUser() {
    if (!user.load() || !user.Id) {
        window.location.href = 'login.html';
        return;
    }
}

async function loadBoards() {
    try {
        console.log('Carregando boards para o usuário:', user.Id);
        const boards = await requests.GetBoards();
        console.log('Boards recebidas:', boards);

        // Filtra as boards do usuário atual
        const userBoards = boards.filter(board => {
            const boardUserId = board.CreatedBy;
            const userId = parseInt(user.Id);
            return boardUserId === userId;
        });

        console.log('Boards do usuário:', userBoards);

        const boardsContainer = document.getElementById('boards');
        const emptyState = document.getElementById('empty-state');

        if (!userBoards || userBoards.length === 0) {
            boardsContainer.style.display = 'none';
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
        }

        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        boardsContainer.style.display = 'contents';
        boardsContainer.innerHTML = '';

        userBoards.forEach((board, index) => {
            const boardElement = document.createElement('div');
            boardElement.className = 'group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform animate-fade-in overflow-hidden cursor-pointer';
            boardElement.style.cssText = `animation-delay: ${index * 0.05}s;`;
            
            // Converte a cor para um formato válido
            const baseColor = board.HexaBackgroundCoor ? 
                (board.HexaBackgroundCoor.startsWith('#') ? board.HexaBackgroundCoor : '#' + board.HexaBackgroundCoor) : 
                '#4F46E5';
            
            boardElement.innerHTML = `
                <div class="relative h-full">
                    <!-- Background com Gradiente -->
                    <div class="absolute inset-0">
                        <div class="absolute inset-0" style="background: linear-gradient(145deg, ${baseColor}, ${baseColor}99);"></div>
                        <div class="absolute inset-0 opacity-30 mix-blend-overlay" style="background-image: radial-gradient(circle at 50% 0%, white 0%, transparent 75%);"></div>
                    </div>

                    <!-- Conteúdo do Card -->
                    <div class="relative p-6">
                        <!-- Cabeçalho -->
                        <div class="flex justify-between items-start mb-6">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg border border-white/20">
                                    <i class="fas fa-clipboard-list text-white text-xl"></i>
                                </div>
                                <div class="flex flex-col">
                                    <h2 class="text-2xl font-bold text-white mb-1 truncate drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                                        ${board.Name}
                                    </h2>
                                    <p class="text-white text-sm line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                                        ${board.Description || 'Sem descrição'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Rodapé -->
                        <div class="flex justify-between items-center mt-6">
                            
                            <!-- Botões de Ação -->
                            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                                <button class="p-2.5 bg-black/30 hover:bg-black/40 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 border border-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" 
                                    title="Editar">
                                    <i class="fas fa-edit text-white"></i>
                                </button>
                                <button class="p-2.5 bg-black/30 hover:bg-red-500/40 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 border border-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" 
                                    title="Excluir">
                                    <i class="fas fa-trash text-white"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Overlay de Hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
            `;

            // Event Delegation com Debounce
            let clickTimeout;
            boardElement.addEventListener('click', (e) => {
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                
                clickTimeout = setTimeout(() => {
                    const target = e.target;
                    
                    if (target.closest('button[title="Editar"]') || target.closest('button[title="Excluir"]')) {
                        e.stopPropagation();
                        const button = target.closest('button');
                        
                        if (button.title === 'Editar') {
                            editBoard(board);
                        } else if (button.title === 'Excluir') {
                            deleteBoard(board.Id);
                        }
                        return;
                    }

                    window.location.href = `board.html?id=${board.Id}`;
                }, 100);
            });

            boardsContainer.appendChild(boardElement);
        });

    } catch (error) {
        console.error('Erro ao carregar boards:', error);
        const boardsContainer = document.getElementById('boards');
        boardsContainer.innerHTML = `
            <div class="col-span-full flex items-center justify-center p-8 bg-red-50 rounded-xl">
                <p class="text-red-600">Erro ao carregar os projetos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

async function editBoard(board) {
    // Implementar edição de board
    console.log('Editar board:', board);
}

async function deleteBoard(boardId) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
        await requests.DeleteBoard(boardId);
        await loadBoards();
    } catch (error) {
        console.error('Erro ao deletar board:', error);
        alert('Erro ao excluir o projeto. Tente novamente.');
    }
}

// Verifica se o usuário está logado antes de carregar as boards
async function init() {
    if (!user.load() || !user.Id) {
        window.location.href = 'login.html';
        return;
    }
    await loadBoards();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    init();

    const addBoardButton = document.getElementById('add-board-button');
    if (addBoardButton) {
        addBoardButton.addEventListener('click', boardActions.addNewBoardForm);
    }

    const searchInput = document.querySelector('input[type="text"]');
    const filterSelect = document.querySelector('select');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterBoards, 300));
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterBoards);
    }
});

function filterBoards() {
    const searchTerm = document.querySelector('input[type="text"]').value.toLowerCase();
    const filterValue = document.querySelector('select').value;
    const boards = document.querySelectorAll('#boards > div');

    boards.forEach(board => {
        const title = board.querySelector('h2').textContent.toLowerCase();
        const description = board.querySelector('p').textContent.toLowerCase();
        const isActive = !board.classList.contains('archived');

        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                            (filterValue === 'active' && isActive) || 
                            (filterValue === 'archived' && !isActive);

        board.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default {
    loadBoards
};


verifyUser();