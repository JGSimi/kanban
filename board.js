import requests from "./request.js";
import user from "./user.js";
import boardActions from "./boardActions.js";
import EmptyState from "./components/EmptyState.js";
import Loading from "./components/Loading.js";
import Column from "./components/Column.js";
import Task from "./components/Task.js";
import DragAndDropService from "./services/DragAndDropService.js";
import AnimationService from "./services/AnimationService.js";

let currentBoard = null;
let dragAndDrop = null;

async function loadBoard() {
    let loadingElement = null;

    try {
        // Mostrar loading
        loadingElement = Loading.show({
            type: 'spinner',
            text: 'Carregando quadro...',
            size: 'lg',
            color: 'blue'
        });

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
            // Criar e mostrar empty state
            const emptyState = new EmptyState({
                title: 'Nenhuma coluna encontrada',
                description: 'Comece adicionando uma nova coluna ao seu quadro!',
                icon: 'fa-columns',
                buttonText: 'Adicionar Coluna',
                buttonIcon: 'fa-plus',
                onClick: boardActions.addNewColumnForm,
                iconColor: 'blue'
            });

            const emptyStateContainer = document.getElementById('empty-state');
            emptyStateContainer.innerHTML = '';
            emptyStateContainer.appendChild(emptyState.create());
            emptyStateContainer.classList.remove('hidden');
            return;
        }

        const boardColumns = document.getElementById('board-columns');
        boardColumns.innerHTML = '';

        // Cria e adiciona as colunas
        columns.forEach(async (columnData, index) => {
            const column = new Column({
                id: columnData.Id,
                name: columnData.Name,
                onAddTask: (columnId) => boardActions.addNewTaskForm(columnId),
                onEditColumn: (column) => editColumn(column),
                onDeleteColumn: (columnId) => deleteColumn(columnId),
                animationDelay: 300 + (index * 100)
            });

            const columnElement = column.create();
            boardColumns.appendChild(columnElement);

            // Carrega as tasks da coluna
            const tasks = await requests.GetTasksByColumnId(columnData.Id);
            const tasksContainer = columnElement.querySelector('.tasks-container');
            tasksContainer.innerHTML = '';

            if (!tasks || tasks.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "flex flex-col items-center justify-center p-4 text-gray-400 text-sm";
                emptyMessage.innerHTML = `
                    <i class="fas fa-tasks mb-2"></i>
                    <p>Nenhuma tarefa</p>
                `;
                tasksContainer.appendChild(emptyMessage);
                return;
            }

            tasks.forEach((taskData, taskIndex) => {
                const task = new Task({
                    id: taskData.Id,
                    title: taskData.Title,
                    description: taskData.Description,
                    isActive: taskData.IsActive,
                    columnId: columnData.Id,
                    onEdit: (task) => editTask(task),
                    onDelete: (taskId) => deleteTask(taskId, columnData.Id),
                    onStatusChange: (taskId, isActive) => updateTaskStatus(taskId, isActive),
                    animationDelay: taskIndex * 0.05
                });

                tasksContainer.appendChild(task.create());
            });
        });

        // Inicializa o serviço de drag and drop
        if (dragAndDrop) {
            dragAndDrop.updateDropzones();
        } else {
            dragAndDrop = new DragAndDropService({
                draggableSelector: '[data-draggable]',
                dropzoneSelector: '[data-dropzone]',
                handleSelector: '[data-drag-handle]',
                onDragStart: (element) => {
                    element.style.opacity = '0.5';
                },
                onDragEnd: (element) => {
                    element.style.opacity = '1';
                },
                onDrop: async (element, dropzone) => {
                    const taskId = element.getAttribute('data-task-id');
                    const newColumnId = dropzone.querySelector('.tasks-container').getAttribute('data-column-id');
                    const oldColumnId = element.closest('.tasks-container').getAttribute('data-column-id');

                    if (oldColumnId !== newColumnId) {
                        try {
                            await requests.UpdateTask({
                                Id: parseInt(taskId),
                                ColumnId: parseInt(newColumnId),
                                UpdatedBy: user.Id
                            });

                            await Promise.all([
                                loadTasks(oldColumnId),
                                loadTasks(newColumnId)
                            ]);
                        } catch (error) {
                            console.error('Erro ao mover task:', error);
                            AnimationService.shake(element);
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Erro ao carregar board:', error);
        
        // Criar empty state de erro
        const errorEmptyState = new EmptyState({
            title: 'Ops! Algo deu errado',
            description: 'Não foi possível carregar o quadro. Tente novamente mais tarde.',
            icon: 'fa-exclamation-triangle',
            buttonText: 'Tentar Novamente',
            buttonIcon: 'fa-redo',
            onClick: () => window.location.reload(),
            iconColor: 'red'
        });

        const errorStateContainer = document.getElementById('error-state');
        errorStateContainer.innerHTML = '';
        errorStateContainer.appendChild(errorEmptyState.create());
        errorStateContainer.classList.remove('hidden');
    } finally {
        // Remove loading
        if (loadingElement) {
            Loading.hide(loadingElement);
        }
    }
}

async function editColumn(column) {
    // Implementar edição de coluna
    console.log('Editar coluna:', column);
}

async function deleteColumn(columnId) {
    if (!confirm('Tem certeza que deseja excluir esta coluna?')) return;

    try {
        const loadingElement = Loading.show({
            type: 'pulse',
            text: 'Excluindo coluna...',
            size: 'md',
            color: 'red'
        });

        await requests.DeleteColumn(columnId);
        Loading.hide(loadingElement);
        await loadBoard();
    } catch (error) {
        console.error('Erro ao deletar coluna:', error);
        alert('Erro ao excluir a coluna. Tente novamente.');
    }
}

async function editTask(task) {
    boardActions.editTaskForm(task);
}

async function deleteTask(taskId, columnId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
        await requests.DeleteTask(taskId);
        await loadTasks(columnId);
    } catch (error) {
        console.error('Erro ao deletar task:', error);
        alert('Erro ao excluir a tarefa. Tente novamente.');
    }
}

async function updateTaskStatus(taskId, isActive) {
    try {
        const task = document.querySelector(`[data-task-id="${taskId}"]`);
        const columnId = task.closest('.tasks-container').getAttribute('data-column-id');

        await requests.UpdateTask({
            Id: taskId,
            IsActive: isActive,
            UpdatedBy: user.Id
        });

        await loadTasks(columnId);
    } catch (error) {
        console.error('Erro ao atualizar status da task:', error);
        alert('Erro ao atualizar status da tarefa. Tente novamente.');
    }
}

async function loadTasks(columnId) {
    try {
        const tasks = await requests.GetTasksByColumnId(columnId);
        const tasksContainer = document.querySelector(`[data-column-id="${columnId}"]`);

        if (!tasksContainer) {
            console.error('Container de tasks não encontrado');
            return;
        }

        tasksContainer.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "flex flex-col items-center justify-center p-4 text-gray-400 text-sm";
            emptyMessage.innerHTML = `
                <i class="fas fa-tasks mb-2"></i>
                <p>Nenhuma tarefa</p>
            `;
            tasksContainer.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((taskData, index) => {
            const task = new Task({
                id: taskData.Id,
                title: taskData.Title,
                description: taskData.Description,
                isActive: taskData.IsActive,
                columnId: columnId,
                onEdit: (task) => editTask(task),
                onDelete: (taskId) => deleteTask(taskId, columnId),
                onStatusChange: (taskId, isActive) => updateTaskStatus(taskId, isActive),
                animationDelay: index * 0.05
            });

            tasksContainer.appendChild(task.create());
        });

    } catch (error) {
        console.error('Erro ao carregar tasks:', error);
        throw error;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadBoard();

    const backButton = document.getElementById('back-button');
    const addColumnButton = document.getElementById('add-column-button');
    const addFirstColumnButton = document.getElementById('add-first-column');

    if (backButton) {
        backButton.addEventListener('click', () => window.location.href = 'index.html');
    }

    if (addColumnButton) {
        addColumnButton.addEventListener('click', boardActions.addNewColumnForm);
    }

    if (addFirstColumnButton) {
        addFirstColumnButton.addEventListener('click', boardActions.addNewColumnForm);
    }
});

export default {
    loadBoard
};