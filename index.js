import requests from "./request.js";
import user from "./user.js";
import boardActions from "./boardActions.js";
import EmptyState from "./components/EmptyState.js";
import Loading from "./components/Loading.js";
import Card from "./components/Card.js";
import DragAndDropService from "./services/DragAndDropService.js";

let dragAndDrop;

async function verifyUser() {
    if (!user.load() || !user.Id) {
        window.location.href = 'login.html';
        return;
    }
}

async function loadBoards() {
    try {
        // Mostrar loading
        const loadingElement = Loading.show({
            type: 'spinner',
            text: 'Carregando seus projetos...',
            size: 'lg',
            color: 'blue'
        });

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
        const emptyStateContainer = document.getElementById('empty-state');

        // Remove loading
        Loading.hide(loadingElement);

        if (!userBoards || userBoards.length === 0) {
            boardsContainer.style.display = 'none';
            
            // Criar e mostrar empty state
            const emptyState = new EmptyState({
                title: 'Nenhum projeto encontrado',
                description: 'Comece criando seu primeiro projeto!',
                icon: 'fa-clipboard-list',
                buttonText: 'Criar Projeto',
                buttonIcon: 'fa-plus',
                onClick: boardActions.addNewBoardForm,
                iconColor: 'blue'
            });

            emptyStateContainer.innerHTML = '';
            emptyStateContainer.appendChild(emptyState.create());
            emptyStateContainer.classList.remove('hidden');
            emptyStateContainer.classList.add('flex');
            return;
        }

        emptyStateContainer.classList.add('hidden');
        emptyStateContainer.classList.remove('flex');
        boardsContainer.style.display = 'contents';
        boardsContainer.innerHTML = '';

        userBoards.forEach((board, index) => {
            const card = new Card({
                title: board.Name,
                description: board.Description,
                backgroundColor: board.HexaBackgroundCoor || '#4F46E5',
                icon: 'fa-clipboard-list',
                onEdit: () => editBoard(board),
                onDelete: () => deleteBoard(board.Id),
                onClick: () => window.location.href = `board.html?id=${board.Id}`,
                animationDelay: index * 0.05,
                draggable: true
            });

            boardsContainer.appendChild(card.create());
        });

        // Inicializa o serviço de drag and drop
        if (dragAndDrop) {
            dragAndDrop.updateDropzones();
        } else {
            dragAndDrop = new DragAndDropService({
                draggableSelector: '[data-draggable]',
                dropzoneSelector: '#boards',
                handleSelector: '[data-drag-handle]',
                onDragStart: (element) => {
                    element.style.opacity = '0.5';
                },
                onDragEnd: (element) => {
                    element.style.opacity = '1';
                },
                onDrop: (element, dropzone) => {
                    // Aqui você pode implementar a lógica de reordenação
                    console.log('Card movido:', element, 'para:', dropzone);
                }
            });
        }

    } catch (error) {
        console.error('Erro ao carregar boards:', error);
        const boardsContainer = document.getElementById('boards');
        
        // Criar empty state de erro
        const errorEmptyState = new EmptyState({
            title: 'Erro ao carregar projetos',
            description: 'Ocorreu um erro ao carregar seus projetos. Tente novamente mais tarde.',
            icon: 'fa-exclamation-triangle',
            buttonText: 'Tentar Novamente',
            buttonIcon: 'fa-sync',
            onClick: loadBoards,
            iconColor: 'red',
            customClass: 'col-span-full'
        });

        boardsContainer.innerHTML = '';
        boardsContainer.appendChild(errorEmptyState.create());
    }
}

async function editBoard(board) {
    // Implementar edição de board
    console.log('Editar board:', board);
}

async function deleteBoard(boardId) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
        const loadingElement = Loading.show({
            type: 'pulse',
            text: 'Excluindo projeto...',
            size: 'md',
            color: 'red'
        });

        await requests.DeleteBoard(boardId);
        Loading.hide(loadingElement);
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