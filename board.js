import requests from "./request.js";
import user from "./user.js";
import boardActions from "./boardActions.js";

let currentBoard = null;
let draggedTask = null;
let dropPlaceholder = null;

async function loadBoard() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const boardColumns = document.getElementById('board-columns');

    try {
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        errorState.classList.add('hidden');

        const urlParams = new URLSearchParams(window.location.search);
        const boardId = urlParams.get('id');

        if (!boardId) {
            throw new Error('ID do quadro não encontrado');
        }

        currentBoard = await requests.GetBoardById(boardId);
        document.getElementById('board-title').textContent = currentBoard.Name;
        document.title = `${currentBoard.Name} - TaskEasy`;

        const columns = await requests.GetColumnsByBoardId(boardId);

        if (!columns || columns.length === 0) {
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        boardColumns.innerHTML = '';

        columns.forEach(async (column, index) => {
            const columnElement = document.createElement('div');
            columnElement.className = 'flex-shrink-0 w-80 bg-gray-50 rounded-xl shadow-md overflow-hidden animate-slide-up';
            columnElement.style.animationDelay = `${index * 0.1}s`;
            columnElement.innerHTML = `
                <div class="p-4 bg-white border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-800">${column.Name}</h3>
                        <div class="flex items-center gap-2">
                            <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-300" title="Editar coluna">
                                <i class="fas fa-pencil text-gray-500 text-sm"></i>
                            </button>
                            <button class="p-1.5 hover:bg-red-50 rounded-full transition-colors duration-300" title="Excluir coluna">
                                <i class="fas fa-trash text-red-500 text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-4">
                    <div class="tasks-container min-h-[200px] space-y-3" data-column-id="${column.Id}">
                        <div class="flex items-center justify-center h-24 text-gray-400">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </div>
                    <button class="add-task-button mt-4 w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 group">
                        <i class="fas fa-plus transform group-hover:rotate-90 transition-transform duration-300"></i>
                        <span>Adicionar Tarefa</span>
                    </button>
                </div>
            `;

            const addTaskButton = columnElement.querySelector('.add-task-button');
            const editColumnButton = columnElement.querySelector('button[title="Editar coluna"]');
            const deleteColumnButton = columnElement.querySelector('button[title="Excluir coluna"]');
            const tasksContainer = columnElement.querySelector('.tasks-container');

            // Event listeners para drag and drop
            tasksContainer.addEventListener('dragover', handleDragOver);
            tasksContainer.addEventListener('dragleave', handleDragLeave);
            tasksContainer.addEventListener('drop', handleDrop);

            // Event listeners para botões
            addTaskButton.onclick = () => boardActions.addNewTaskForm(column.Id);
            editColumnButton.onclick = () => editColumn(column);
            deleteColumnButton.onclick = () => deleteColumn(column.Id);

            boardColumns.appendChild(columnElement);
            await boardActions.loadTasks(column.Id);
        });

    } catch (error) {
        console.error('Erro ao carregar board:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    } finally {
        loadingState.classList.add('hidden');
    }
}

async function createTask(columnId) {
    try {
        // Abre o formulário de nova tarefa
        const taskForm = await boardActions.addNewTaskForm(columnId);
        
        // Anima o botão de adicionar
        const addButton = document.getElementById('add-task-button-' + columnId);
        addButton.classList.add('scale-95', 'bg-blue-100');
        
        setTimeout(() => {
            addButton.classList.remove('scale-95', 'bg-blue-100'); 
            addButton.click();
        }, 200);

        return taskForm;
    } catch (error) {
        console.error('Erro ao criar nova tarefa:', error);
        throw new Error('Não foi possível criar a tarefa. Tente novamente.');
    }
}

async function editColumn(column) {
    // Implementar edição de coluna
    console.log('Editar coluna:', column);
}

async function deleteColumn(columnId) {
    if (!confirm('Tem certeza que deseja excluir esta coluna?')) return;

    try {
        await requests.DeleteColumn(columnId);
        await loadBoard();
    } catch (error) {
        console.error('Erro ao deletar coluna:', error);
        alert('Erro ao excluir a coluna. Tente novamente.');
    }
}

// Funções de Drag and Drop
function handleDragStart(e) {
    draggedTask = e.target;
    
    // Adiciona classe para estilo durante o drag
    draggedTask.classList.add('opacity-50', 'scale-105', 'rotate-2');
    
    // Armazena dados da task
    e.dataTransfer.setData('text/plain', draggedTask.getAttribute('data-task-id'));

    // Cria o placeholder se ainda não existir
    if (!dropPlaceholder) {
        dropPlaceholder = document.createElement('div');
        dropPlaceholder.className = 'h-24 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 bg-opacity-50 transition-all duration-300';
    }

    // Delay para melhor feedback visual
    requestAnimationFrame(() => {
        draggedTask.style.opacity = '0.5';
        draggedTask.style.transform = 'scale(1.05) rotate(2deg)';
    });
}

function handleDragEnd(e) {
    if (!draggedTask) return;

    // Remove estilos de drag
    draggedTask.classList.remove('opacity-50', 'scale-105', 'rotate-2');
    draggedTask.style.opacity = '';
    draggedTask.style.transform = '';
    
    // Remove placeholder
    if (dropPlaceholder && dropPlaceholder.parentNode) {
        dropPlaceholder.remove();
    }
    
    // Remove highlight das colunas
    document.querySelectorAll('.tasks-container').forEach(container => {
        container.classList.remove('bg-blue-50');
    });
    
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    const container = e.currentTarget;
    
    if (!draggedTask || !dropPlaceholder) return;

    // Adiciona highlight na coluna
    container.classList.add('bg-blue-50');
    
    const afterElement = getDragAfterElement(container, e.clientY);
    
    if (afterElement) {
        container.insertBefore(dropPlaceholder, afterElement);
    } else {
        container.appendChild(dropPlaceholder);
    }
}

function handleDragLeave(e) {
    const container = e.currentTarget;
    container.classList.remove('bg-blue-50');
}

async function handleDrop(e) {
    e.preventDefault();
    const container = e.currentTarget;
    container.classList.remove('bg-blue-50');
    
    if (!draggedTask) return;

    try {
        const taskId = e.dataTransfer.getData('text/plain');
        const newColumnId = container.getAttribute('data-column-id');
        const oldColumnId = draggedTask.closest('.tasks-container').getAttribute('data-column-id');
        
        // Se a task foi movida para uma coluna diferente
        if (oldColumnId !== newColumnId) {
            // Adiciona animação de saída
            draggedTask.classList.add('task-dropped');
            
            await requests.UpdateTask({
                Id: parseInt(taskId),
                ColumnId: parseInt(newColumnId),
                UpdatedBy: user.Id
            });

            // Recarrega as tasks das duas colunas
            await Promise.all([
                boardActions.loadTasks(oldColumnId),
                boardActions.loadTasks(newColumnId)
            ]);
        } else {
            // Se for na mesma coluna, apenas reposiciona
            if (dropPlaceholder && dropPlaceholder.parentNode) {
                container.insertBefore(draggedTask, dropPlaceholder);
            } else {
                container.appendChild(draggedTask);
            }
            draggedTask.classList.add('task-dropped');
        }
        
        setTimeout(() => {
            if (draggedTask) {
                draggedTask.classList.remove('task-dropped');
            }
        }, 300);
        
    } catch (error) {
        console.error('Erro ao mover task:', error);
        alert('Erro ao mover a tarefa. Tente novamente.');
    } finally {
        // Limpa o estado do drag and drop
        if (dropPlaceholder && dropPlaceholder.parentNode) {
            dropPlaceholder.remove();
        }
        draggedTask = null;
        dropPlaceholder = null;
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.opacity-50)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Modifica a função loadTasks do boardActions para adicionar os event listeners de drag and drop
const originalLoadTasks = boardActions.loadTasks;
boardActions.loadTasks = async function(columnId) {
    await originalLoadTasks(columnId);
    
    // Adiciona event listeners de drag and drop para as novas tasks
    const tasks = document.querySelectorAll(`[data-column-id="${columnId}"] .task`);
    tasks.forEach(task => {
        task.draggable = true;
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
    });
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado
    if (!user.load() || !user.Id) {
        window.location.href = 'login.html';
        return;
    }

    loadBoard();

    // Botão de voltar
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.onclick = () => window.location.href = 'index.html';
    }

    // Botão de adicionar coluna
    const addColumnButton = document.getElementById('add-column-button');
    const addFirstColumnButton = document.getElementById('add-first-column');
    
    if (addColumnButton) {
        addColumnButton.onclick = boardActions.addNewColumnForm;
    }
    
    if (addFirstColumnButton) {
        addFirstColumnButton.onclick = boardActions.addNewColumnForm;
    }

    // Botões de configuração e compartilhamento
    const settingsButton = document.getElementById('board-settings');
    const shareButton = document.getElementById('board-share');

    if (settingsButton) {
        settingsButton.onclick = () => {
            // Implementar configurações do board
            console.log('Abrir configurações do board');
        };
    }

    if (shareButton) {
        shareButton.onclick = () => {
            // Implementar compartilhamento do board
            console.log('Abrir opções de compartilhamento');
        };
    }
});

export default {
    loadBoard
};