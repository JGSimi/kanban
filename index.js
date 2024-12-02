import requests from "./request.js";
import user from "./user.js";
import boardActions from "./boardActions.js";

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
            boardElement.className = 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] transform';
            boardElement.style.animationDelay = `${index * 0.1}s`;
            boardElement.innerHTML = `
                <div class="relative overflow-hidden rounded-xl">
                    <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div class="h-32" style="background-color: ${board.HexaBackgroundCoor || '#4F46E5'}"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h2 class="text-xl font-bold truncate">${board.Name}</h2>
                        <p class="text-sm opacity-90 truncate">${board.Description || 'Sem descrição'}</p>
                    </div>
                </div>
                <div class="p-4 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-gray-600">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date(board.CreatedAt).toLocaleDateString()}
                        </span>
                        <span class="text-sm text-gray-600">
                            <i class="fas fa-list-check mr-1"></i>
                            ${board.TaskCount || 0} tarefas
                        </span>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300" title="Editar">
                            <i class="fas fa-edit text-gray-600"></i>
                        </button>
                        <button class="p-2 hover:bg-red-50 rounded-full transition-colors duration-300" title="Excluir">
                            <i class="fas fa-trash text-red-500"></i>
                        </button>
                    </div>
                </div>
            `;

            boardElement.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                window.location.href = `board.html?id=${board.Id}`;
            });

            const editButton = boardElement.querySelector('button[title="Editar"]');
            const deleteButton = boardElement.querySelector('button[title="Excluir"]');

            editButton.addEventListener('click', () => editBoard(board));
            deleteButton.addEventListener('click', () => deleteBoard(board.Id));

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
