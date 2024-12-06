import requests from "./request.js";
import user from "./user.js";
import Modal from './components/Modal.js';
import Card from './components/Card.js';
import AnimationService from './services/AnimationService.js';
import Loading from './components/Loading.js';
import Task from './components/Task.js';

function backToBoardList() {
    window.location.href = 'index.html';
}

async function addNewBoard(name, color, description) {
    const userId = user.Id;
    if (!userId) {
        throw new Error('Usuário não autenticado');
    }

    const boardData = {
        Name: name.trim(),
        Description: description ? description.trim() : '',
        HexaBackgroundCoor: color,
        IsActive: true,
        CreatedBy: parseInt(userId),
        UpdatedBy: parseInt(userId)
    };

    console.log('Dados do board a serem enviados:', boardData);

    try {
        const response = await requests.CreateBoard(boardData);
        console.log('Resposta do servidor:', response);
        return response;
    } catch (error) {
        console.error('Erro detalhado ao criar board:', error);
        throw error;
    }
}

function addNewBoardForm() {
    const modal = new Modal({
        title: 'Novo Quadro',
        icon: 'fa-clipboard-list',
        iconColor: 'blue',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Quadro</label>
                    <input id="name" type="text" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Digite o nome do quadro (mínimo 10 caracteres)" 
                        minlength="10"
                        maxlength="100"
                        required>
                    <p id="name-error" class="text-sm text-red-500 dark:text-red-400 hidden"></p>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Quadro</label>
                    <div class="flex gap-4 items-center">
                        <input id="color" type="color" 
                            class="w-16 h-16 rounded-xl cursor-pointer bg-white dark:bg-gray-800" 
                            value="#4F46E5">
                        <div class="flex-1 h-16 rounded-xl transition-all duration-300" id="color-preview" style="background: linear-gradient(145deg, #4F46E5, #4F46E599);"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Descreva o propósito do quadro" 
                        maxlength="500"
                        rows="3"></textarea>
                </div>
            </div>
        `,
        confirmText: 'Criar Quadro',
        cancelText: 'Cancelar',
        onOpen: () => {
            // Atualiza preview da cor quando o input muda
            const colorInput = document.getElementById('color');
            const colorPreview = document.getElementById('color-preview');
            colorInput.addEventListener('input', (e) => {
                colorPreview.style.background = `linear-gradient(145deg, ${e.target.value}, ${e.target.value}99)`;
            });

            // Adiciona validação em tempo real
            const nameInput = document.getElementById('name');
            const nameError = document.getElementById('name-error');
            
            nameInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length === 0) {
                    nameError.textContent = 'O nome do quadro é obrigatório';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro é obrigatório');
                } else if (value.length < 10) {
                    nameError.textContent = 'O nome do quadro deve ter no mínimo 10 caracteres';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro deve ter no mínimo 10 caracteres');
                } else if (value.length > 100) {
                    nameError.textContent = 'O nome do quadro deve ter no máximo 100 caracteres';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro deve ter no máximo 100 caracteres');
                } else {
                    nameError.classList.add('hidden');
                    e.target.setCustomValidity('');
                }
            });
        },
        onConfirm: async () => {
            const nameInput = document.getElementById('name');
            const name = nameInput.value.trim();
            const color = document.getElementById('color').value;
            const description = document.getElementById('description').value.trim();

            // Validação final antes de enviar
            if (!name) {
                nameInput.setCustomValidity('O nome do quadro é obrigatório');
                nameInput.reportValidity();
                return;
            }

            if (name.length < 10) {
                nameInput.setCustomValidity('O nome do quadro deve ter no mínimo 10 caracteres');
                nameInput.reportValidity();
                return;
            }

            try {
                await addNewBoard(name, color, description);
                window.location.reload();
            } catch (error) {
                console.error('Erro ao criar quadro:', error);
                const nameError = document.getElementById('name-error');
                nameError.textContent = 'Erro ao criar o quadro. Por favor, verifique os dados e tente novamente.';
                nameError.classList.remove('hidden');
            }
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

async function addNewColumn(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');

    if (!boardId) {
        console.error('ID da board não encontrado');
        return;
    }

    try {
        await requests.CreateColumn({
            BoardId: parseInt(boardId),
            Name: name,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });

        window.location.reload();
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
        throw error;
    }
}

function addNewColumnForm() {
    const modal = new Modal({
        title: 'Nova Coluna',
        icon: 'fa-columns',
        iconColor: 'indigo',
        size: 'sm',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Coluna</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Digite o nome da coluna" required>
                </div>
            </div>
        `,
        confirmText: 'Criar Coluna',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            await addNewColumn(name);
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

async function addNewTask(columnId, name, description) {
    if (!columnId) {
        console.error('ID da coluna não encontrado');
        return;
    }

    try {
        await requests.CreateTask({
            ColumnId: parseInt(columnId),
            Title: name,
            Description: description,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });

        await loadTasks(columnId);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
    }
}

function addNewTaskForm(columnId) {
    const modal = new Modal({
        title: 'Nova Tarefa',
        icon: 'fa-tasks',
        iconColor: 'green',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Título da Tarefa</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Digite o título da tarefa" required>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Descreva os detalhes da tarefa" rows="3"></textarea>
                </div>
            </div>
        `,
        confirmText: 'Criar Tarefa',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            await addNewTask(columnId, name, description);
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

function editTaskForm(task) {
    const modal = new Modal({
        title: 'Editar Tarefa',
        icon: 'fa-edit',
        iconColor: 'yellow',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Título da Tarefa</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Digite o título da tarefa" 
                        value="${task.title}" required>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Descreva os detalhes da tarefa" rows="3">${task.description || ''}</textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="isActive" class="w-4 h-4 text-blue-600 rounded bg-white dark:bg-gray-800" ${task.isActive ? 'checked' : ''}>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Tarefa ativa</label>
                </div>
            </div>
        `,
        confirmText: 'Salvar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const isActive = document.getElementById('isActive').checked;

            await requests.UpdateTask({
                Id: task.id,
                Title: name,
                Description: description,
                IsActive: isActive,
                UpdatedBy: user.Id
            });

            await loadTasks(task.columnId);
        }
    });

    modal.create();
    document.getElementById('name').focus();
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
            emptyMessage.className = "flex flex-col items-center justify-center p-4 text-gray-400 dark:text-gray-500 text-sm";
            emptyMessage.innerHTML = `
                <i class="fas fa-tasks mb-2"></i>
                <p>Nenhuma tarefa</p>
            `;
            tasksContainer.appendChild(emptyMessage);
            return;
        }

        const taskElements = tasks.map((taskData, index) => {
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

            return task.create();
        });

        taskElements.forEach(element => tasksContainer.appendChild(element));

    } catch (error) {
        console.error('Erro ao carregar tasks:', error);
        throw error;
    }
}

async function updateBoard(boardId, name, color, description, isActive) {
    const userId = user.Id;
    if (!userId) {
        throw new Error('Usuário não autenticado');
    }

    // Primeiro, busca a board atual para manter campos importantes
    const currentBoard = await requests.GetBoardById(boardId);
    
    // Prepara os dados para atualização mantendo campos importantes
    const boardData = {
        Id: parseInt(boardId),
        Name: name.trim(),
        Description: description ? description.trim() : '',
        HexaBackgroundCoor: color,
        IsActive: isActive,
        CreatedBy: currentBoard.CreatedBy, // Mantém o criador original
        UpdatedBy: parseInt(userId)
    };

    console.log('Dados da board para atualização:', boardData);

    try {
        const response = await requests.UpdateBoard(boardData);
        console.log('Resposta da atualização:', response);
        return response;
    } catch (error) {
        console.error('Erro ao atualizar board:', error);
        throw error;
    }
}

function editBoardForm(board) {
    const modal = new Modal({
        title: 'Editar Quadro',
        icon: 'fa-edit',
        iconColor: 'yellow',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Quadro</label>
                    <input id="name" type="text" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Digite o nome do quadro (mínimo 10 caracteres)" 
                        value="${board.Name}"
                        minlength="10"
                        maxlength="100"
                        required>
                    <p id="name-error" class="text-sm text-red-500 dark:text-red-400 hidden"></p>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cor do Quadro</label>
                    <div class="flex gap-4 items-center">
                        <input id="color" type="color" 
                            class="w-16 h-16 rounded-xl cursor-pointer bg-white dark:bg-gray-800" 
                            value="${board.HexaBackgroundCoor || '#4F46E5'}">
                        <div class="flex-1 h-16 rounded-xl transition-all duration-300" id="color-preview" 
                            style="background: linear-gradient(145deg, ${board.HexaBackgroundCoor || '#4F46E5'}, ${board.HexaBackgroundCoor || '#4F46E5'}99);"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        placeholder="Descreva o propósito do quadro" 
                        maxlength="500"
                        rows="3">${board.Description || ''}</textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="isActive" 
                        class="w-4 h-4 text-blue-600 rounded bg-white dark:bg-gray-800" 
                        ${board.IsActive ? 'checked' : ''}>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Quadro ativo</label>
                </div>
            </div>
        `,
        confirmText: 'Salvar Alterações',
        cancelText: 'Cancelar',
        onOpen: () => {
            // Atualiza preview da cor quando o input muda
            const colorInput = document.getElementById('color');
            const colorPreview = document.getElementById('color-preview');
            colorInput.addEventListener('input', (e) => {
                colorPreview.style.background = `linear-gradient(145deg, ${e.target.value}, ${e.target.value}99)`;
            });

            // Adiciona validação em tempo real
            const nameInput = document.getElementById('name');
            const nameError = document.getElementById('name-error');
            
            nameInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length === 0) {
                    nameError.textContent = 'O nome do quadro é obrigatório';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro é obrigatório');
                } else if (value.length < 10) {
                    nameError.textContent = 'O nome do quadro deve ter no mínimo 10 caracteres';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro deve ter no mínimo 10 caracteres');
                } else if (value.length > 100) {
                    nameError.textContent = 'O nome do quadro deve ter no máximo 100 caracteres';
                    nameError.classList.remove('hidden');
                    e.target.setCustomValidity('O nome do quadro deve ter no máximo 100 caracteres');
                } else {
                    nameError.classList.add('hidden');
                    e.target.setCustomValidity('');
                }
            });
        },
        onConfirm: async () => {
            const nameInput = document.getElementById('name');
            const name = nameInput.value.trim();
            const color = document.getElementById('color').value;
            const description = document.getElementById('description').value.trim();
            const isActive = document.getElementById('isActive').checked;

            // Validação final antes de enviar
            if (!name) {
                nameInput.setCustomValidity('O nome do quadro é obrigatório');
                nameInput.reportValidity();
                return;
            }

            if (name.length < 10) {
                nameInput.setCustomValidity('O nome do quadro deve ter no mínimo 10 caracteres');
                nameInput.reportValidity();
                return;
            }

            try {
                const loadingElement = Loading.show({
                    type: 'spinner',
                    text: 'Salvando alterações...',
                    size: 'md',
                    color: 'blue'
                });

                await updateBoard(board.Id, name, color, description, isActive);
                Loading.hide(loadingElement);
                window.location.reload();
            } catch (error) {
                console.error('Erro ao atualizar quadro:', error);
                const nameError = document.getElementById('name-error');
                nameError.textContent = 'Erro ao atualizar o quadro. Por favor, verifique os dados e tente novamente.';
                nameError.classList.remove('hidden');
            }
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

export default {
    backToBoardList,
    addNewBoardForm,
    addNewColumnForm,
    addNewTaskForm,
    editTaskForm,
    editBoardForm,
    loadTasks
};
